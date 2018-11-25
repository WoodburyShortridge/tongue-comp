import json
import glob

right = []
left = []
none = []

rightImgs = glob.glob('right/*.jpg')
for img in rightImgs:
    right.append(img)

leftImgs = glob.glob('left/*.jpg')
for img in leftImgs:
    left.append(img)

noneImgs = glob.glob('none/*.jpg')
for img in noneImgs:
    none.append(img)

data = {"right": right, "left": left, "none": none}

with open('data.json', 'w') as outfile:
    json.dump(data, outfile)
