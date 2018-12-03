import cv2
import datetime
import json
import glob

# Windows dependencies
# - Python 2.7.6: http://www.python.org/download/
# - OpenCV: http://opencv.org/
# - Numpy -- get numpy from here because the official builds don't support x64:
#   http://www.lfd.uci.edu/~gohlke/pythonlibs/#numpy

# Mac Dependencies
# - brew install python
# - pip install numpy
# - brew tap homebrew/science
# - brew install opencv


# INSTRUCTIONS:
# run with `python camera.py`
# while running hit 'r' key to take right photos
# hit 'l' key to take left photos
# hit 'n' key to take none photos
# use the 'q' key or control + c to stop


right = []
left = []
none = []
CASCADE_PATH = "haarcascades/mouth.xml"
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

cap = cv2.VideoCapture(0)

def generate(img, path):
    if (img is None):
        print("Can't read")
        return 0

    faces = face_cascade.detectMultiScale(img, 1.1, 3, minSize=(100, 100))
    if (faces is None):
        print('Failed to detect face')
        return 0

    facecnt = len(faces)
    print("Detected faces: %d" % facecnt)
    i = 0
    height, width = img.shape[:2]

    for (x, y, w, h) in faces:
        r = max(w, h) / 2
        centerx = x + w / 2
        centery = y + h / 2
        nx = int(centerx - r)
        ny = int(centery - r)
        nr = int(r * 2)

        faceimg = img[ny:ny+nr, nx:nx+nr]
        lastimg = cv2.resize(faceimg, (227, 227))
        cv2.imwrite(path, lastimg)

while(True):
    ret, frame = cap.read()
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2BGRA)
    # image = cv2.resize(rgb,(int(227),int(227)))
    image = rgb
    cv2.imshow('image', image)
    c = cv2.waitKey(1)
    if c == ord('r'):
#    if c == ord('d'):
        generate(image, './right/right_' + datetime.datetime.now().strftime("%Y-%m-%d-%H_%M_%S") + '.jpg')
    if c == ord('l'):
#    if c == ord('i'):
        generate(image, './left/left_' + datetime.datetime.now().strftime("%Y-%m-%d-%H_%M_%S") + '.jpg')
    if c == ord('n'):
        generate(image, './none/none_' + datetime.datetime.now().strftime("%Y-%m-%d-%H_%M_%S") + '.jpg')
    if c == ord('q'):
        # make json on quit
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

        break

cap.release()
cv2.destroyAllWindows()
