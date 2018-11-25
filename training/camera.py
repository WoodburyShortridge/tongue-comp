import cv2
import datetime

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

cap = cv2.VideoCapture(0)

while(True):
    ret, frame = cap.read()
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2BGRA)
    image = cv2.resize(rgb,(int(227),int(227)))
    cv2.imshow('image', image)
    c = cv2.waitKey(1)
    if c == ord('r'):
#    if c == ord('d'):
        # Windows can't write colons in file names
        out = cv2.imwrite('./right/right_' + datetime.datetime.now().strftime("%Y-%m-%d-%H_%M_%S") + '.jpg', image)
        print(out)
    if c == ord('l'):
#    if c == ord('i'):
        out = cv2.imwrite('./left/left_' + datetime.datetime.now().strftime("%Y-%m-%d-%H_%M_%S") + '.jpg', image)
        print(out)
    if c == ord('n'):
        out = cv2.imwrite('./none/none_' + datetime.datetime.now().strftime("%Y-%m-%d-%H_%M_%S") + '.jpg', image)
        print(out)
    if c == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
