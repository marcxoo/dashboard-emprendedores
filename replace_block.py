
import os

file_path = '/Users/marcos/Desktop/dashboard emprendedores/src/components/SurveyEventDashboard.jsx'
new_content_path = '/Users/marcos/Desktop/dashboard emprendedores/new_content.jsx'

with open(file_path, 'r') as f:
    lines = f.readlines()

with open(new_content_path, 'r') as f:
    new_lines = f.readlines()

# Line numbers (1-based) to replace: 1670 to 2167
# Indices (0-based): 1669 to 2166
# Content to keep: [:1669] and [2167:]

before = lines[:1669]
after = lines[2167:]

# Ensure new_content ends with a newline if needed
if not new_lines[-1].endswith('\n'):
    new_lines[-1] += '\n'

combined = before + new_lines + after

with open(file_path, 'w') as f:
    f.writelines(combined)

print(f"Successfully replaced lines 1670-2167 with new content. Total lines: {len(combined)}")
