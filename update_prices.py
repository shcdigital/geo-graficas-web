import os
import re

def get_category(price_str):
    # Clean the price string
    price_str = price_str.replace('$', '').replace('AR$', '').replace('.', '').replace(',', '').strip()
    try:
        price = int(price_str)
        if price <= 1000: return "Cat-A"
        if price < 5000: return "Cat-B"
        if price < 10000: return "Cat-C"
        if price < 20000: return "Cat-D"
        if price < 50000: return "Cat-E"
        if price < 100000: return "Cat-F"
        if price < 200000: return "Cat-G"
        if price < 500000: return "Cat-H"
        if price < 1000000: return "Cat-I"
        return "Cat-J"
    except ValueError:
        return "Cat-A"

directory = "/home/pablo/GITLAB/geo-graficas-web/src/content/recursos/"
files = [f for f in os.listdir(directory) if f.endswith('.md')]

for filename in files:
    path = os.path.join(directory, filename)
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    for i, line in enumerate(lines):
        if i == 12 and line.startswith('precio:'):
            price_val = line.split(':')[1].strip().strip('"')
            category = get_category(price_val)
            new_lines.append(f'precio: "{category}"\n')
        else:
            new_lines.append(line)

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

print(f"Updated {len(files)} files.")
