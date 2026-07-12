import re
import random

file_path = r'D:\Pro_jects\Tourism\src\main\java\com\Tourism\Tourism\config\DataInitializer.java'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def get_entry_fee(cat):
    if cat in ['heritage', 'spiritual']:
        return "₹50 for Adults, ₹20 for Children"
    elif cat in ['beach', 'nature']:
        return "Free"
    else:
        return "₹100"

featured_cities = set()

def split_args(arg_string):
    args = []
    current = []
    in_quotes = False
    for char in arg_string:
        if char == '"':
            in_quotes = not in_quotes
        if char == ',' and not in_quotes:
            args.append("".join(current).strip())
            current = []
        else:
            current.append(char)
    args.append("".join(current).strip())
    return args

def replacement(match):
    arg_string = match.group(1)
    args = split_args(arg_string)
    
    if len(args) != 12:
        return match.group(0) # Skip if already updated or not a standard call
    
    name = args[0].strip('"')
    city_var = args[1]
    cat_var = args[2]
    
    fee = get_entry_fee(cat_var)
    rating = round(random.uniform(4.2, 4.9), 1)
    reviews = random.randint(500, 10000)
    
    spot_query = name.replace(' ', '+')
    city_name = city_var.capitalize()
    if city_var == 'sambhajiNagar':
        city_name = 'Chhatrapati Sambhaji Nagar'
    
    maps_url = f"https://www.google.com/maps/search/?api=1&query={spot_query}+{city_name.replace(' ', '+')}"
    
    featured = "false"
    if city_var not in featured_cities:
        featured = "true"
        featured_cities.add(city_var)
    
    accessibility = '"General accessibility available."'
    transport = '"Easily accessible via public transport."'
    
    new_args = args + [f'{accessibility}', f'{transport}', f'"{fee}"', str(rating), str(reviews), f'"{maps_url}"', featured]
    return f'createSpotIfNotExists({", ".join(new_args)})'

pattern = re.compile(r'createSpotIfNotExists\((.*?)\)', re.DOTALL)
new_content = pattern.sub(replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement complete.")
