import os
import glob
import re

guardrail = """\n\nCRITICAL ANTI-HALLUCINATION RULES:
1. Do NOT invent or estimate prices, availability, or booking status. All financial and inventory claims MUST come from provided tool data or context.
2. Do NOT invent routes, distances, or durations. Use routing data provided.
3. Do NOT invent places, weather, or policies. Rely strictly on Trusted Data and RAG.
4. If you lack the deterministic data to answer a specific factual claim, explicitly state 'Information Unavailable'. Do NOT guess."""

files = glob.glob("backend/app/services/*.py")
for f in files:
    with open(f, "r") as file:
        content = file.read()
    
    # We will look for SYSTEM_INSTRUCTION = \"\"\" ... \"\"\" and append our guardrail before the closing \"\"\"
    
    # Regex to find multi-line strings assigned to a variable ending with SYSTEM_INSTRUCTION or similar
    # It's safer to just inject it if SYSTEM_INSTRUCTION exists.
    
    if "SYSTEM_INSTRUCTION" in content:
        # Find the end of the docstring for SYSTEM_INSTRUCTION
        # This is a bit tricky with regex, let's use a simpler approach
        # Split on SYSTEM_INSTRUCTION
        parts = content.split("SYSTEM_INSTRUCTION =")
        if len(parts) > 1:
            for i in range(1, len(parts)):
                if '"""' in parts[i]:
                    subparts = parts[i].split('"""')
                    if len(subparts) >= 3: # [" = ", " text ", " rest "]
                        if "CRITICAL ANTI-HALLUCINATION RULES" not in subparts[1]:
                            subparts[1] = subparts[1] + guardrail + "\n    "
                        parts[i] = '"""'.join(subparts)
        
        content = "SYSTEM_INSTRUCTION =".join(parts)
        
    with open(f, "w") as file:
        file.write(content)

print("Guardrails injected.")
