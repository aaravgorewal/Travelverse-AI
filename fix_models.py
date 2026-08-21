import glob
import re

files = glob.glob("backend/app/models/*.py")
for f in files:
    with open(f, "r") as file:
        content = file.read()
    
    # Replace Column(String, ForeignKey...) with Column(Uuid, ForeignKey(..., ondelete="CASCADE")...)
    # This requires adding Uuid to the imports if it's not there.
    
    if "ForeignKey" in content:
        if "from sqlalchemy import" in content and "Uuid" not in content:
            content = content.replace("from sqlalchemy import ", "from sqlalchemy import Uuid, ")
            
        # Regex to find Column(String, ForeignKey("table.id"), ...)
        # We need to capture everything else.
        content = re.sub(r'Column\(\s*String\s*,\s*ForeignKey\((.*?)\)(.*?)\)', r'Column(Uuid, ForeignKey(\1, ondelete="CASCADE")\2)', content)
        
    with open(f, "w") as file:
        file.write(content)

print("Foreign keys updated to Uuid and CASCADE.")
