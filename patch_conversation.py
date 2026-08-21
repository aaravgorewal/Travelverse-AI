with open("backend/app/services/conversation.py", "r") as f:
    content = f.read()

if "async def delete_memory" not in content:
    content += """
    async def delete_memory(self, user_id: str, key: str):
        stmt = select(AIMemory).where(AIMemory.user_id == user_id, AIMemory.key == key)
        result = await self.session.execute(stmt)
        memory = result.scalar_one_or_none()
        if not memory:
            raise PermissionError("Memory not found or unauthorized.")
            
        await self.session.delete(memory)
        await self.session.commit()
"""
    with open("backend/app/services/conversation.py", "w") as f:
        f.write(content)
print("Updated conversation.py")
