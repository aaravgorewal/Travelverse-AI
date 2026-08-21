import uuid
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.ai import Conversation, Message, AIMemory
from app.providers.gemini import GeminiProvider

logger = logging.getLogger(__name__)

class ConversationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_conversation(self, user_id: str, conversation_id: Optional[str] = None) -> Conversation:
        if conversation_id:
            stmt = select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
            result = await self.session.execute(stmt)
            conv = result.scalar_one_or_none()
            if conv:
                return conv
                
        # Create new
        new_conv = Conversation(
            id=conversation_id or str(uuid.uuid4()),
            user_id=user_id,
            title="New Conversation"
        )
        self.session.add(new_conv)
        await self.session.commit()
        await self.session.refresh(new_conv)
        return new_conv

    async def add_message(self, conversation_id: str, role: str, content: str) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        self.session.add(msg)
        await self.session.commit()
        return msg

    async def get_recent_messages(self, conversation_id: str, limit: int = 6) -> List[Message]:
        stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(desc(Message.created_at)).limit(limit)
        result = await self.session.execute(stmt)
        messages = list(result.scalars().all())
        messages.reverse() # Oldest first for context
        return messages

    async def get_summary(self, user_id: str, conversation_id: str) -> str:
        stmt = select(AIMemory).where(
            AIMemory.user_id == user_id,
            AIMemory.key == f"summary_{conversation_id}"
        )
        result = await self.session.execute(stmt)
        memory = result.scalar_one_or_none()
        return memory.value.get("summary", "") if memory else ""

    async def update_summary(self, user_id: str, conversation_id: str, new_summary: str):
        stmt = select(AIMemory).where(
            AIMemory.user_id == user_id,
            AIMemory.key == f"summary_{conversation_id}"
        )
        result = await self.session.execute(stmt)
        memory = result.scalar_one_or_none()
        
        if memory:
            memory.value = {"summary": new_summary}
        else:
            memory = AIMemory(
                user_id=user_id,
                key=f"summary_{conversation_id}",
                value={"summary": new_summary}
            )
            self.session.add(memory)
        await self.session.commit()

    async def generate_and_update_summary_task(self, user_id: str, conversation_id: str):
        """Intended to be run in the background after messages are added."""
        try:
            # Fetch all messages to generate a comprehensive summary
            stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at)
            result = await self.session.execute(stmt)
            messages = result.scalars().all()
            
            if len(messages) < 4:
                return # Not enough context to bother summarizing
                
            formatted_history = "\n".join([f"{m.role}: {m.content}" for m in messages])
            
            # Use Gemini to summarize
            provider = GeminiProvider()
            summary_prompt = f"Summarize the following travel conversation in a concise paragraph. Focus on the user's intent, preferences, constraints (like dates/budget), and the current state of planning.\n\n{formatted_history}"
            
            summary = await provider.generate(prompt=summary_prompt, model="gemini-1.5-flash")
            
            # Update DB
            await self.update_summary(user_id, conversation_id, summary)
            
            # Optionally update title if it's the first summary
            if len(messages) <= 6:
                title_prompt = f"Generate a short, 3-5 word title for this conversation:\n\n{formatted_history}"
                title = await provider.generate(prompt=title_prompt, model="gemini-1.5-flash")
                
                conv_stmt = select(Conversation).where(Conversation.id == conversation_id)
                conv_result = await self.session.execute(conv_stmt)
                conv = conv_result.scalar_one_or_none()
                if conv and conv.title == "New Conversation":
                    conv.title = title.strip().replace('"', '')
                    await self.session.commit()
                    
        except Exception as e:
            logger.error(f"Failed to generate summary for {conversation_id}: {e}")

    async def list_conversations(self, user_id: str) -> List[Conversation]:
        stmt = select(Conversation).where(Conversation.user_id == user_id).order_by(desc(Conversation.created_at))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
        
    async def get_conversation_history(self, user_id: str, conversation_id: str) -> List[Message]:
        # Verify ownership
        stmt = select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        result = await self.session.execute(stmt)
        if not result.scalar_one_or_none():
            raise PermissionError("Conversation not found or unauthorized.")
            
        stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def delete_conversation(self, user_id: str, conversation_id: str):
        stmt = select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        result = await self.session.execute(stmt)
        conv = result.scalar_one_or_none()
        if not conv:
            raise PermissionError("Conversation not found or unauthorized.")
            
        await self.session.delete(conv)
        await self.session.commit()

    async def delete_memory(self, user_id: str, key: str):
        stmt = select(AIMemory).where(AIMemory.user_id == user_id, AIMemory.key == key)
        result = await self.session.execute(stmt)
        memory = result.scalar_one_or_none()
        if not memory:
            raise PermissionError("Memory not found or unauthorized.")
            
        await self.session.delete(memory)
        await self.session.commit()
