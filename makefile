#--------------------------------
# imgcomp makefile for Linux (raspberry pi)
#--------------------------------
OBJ=obj
SRC=.
CFLAGS:= $(CFLAGS) -O3 -Wall

all: imgcomp blink_camera_led

objs = $(OBJ)/main.o $(OBJ)/compare.o $(OBJ)/jpeg2mem.o \
	$(OBJ)/jpgfile.o $(OBJ)/exif.o $(OBJ)/start_raspistill.o $(OBJ)/util.o

$(OBJ)/jpgfile.o $(OBJ)/exif.o $(OBJ)/start_raspistill.o: jhead.h

$(OBJ)/%.o:$(SRC)/%.c imgcomp.h
	${CC} $(CFLAGS) -c $< -o $@

imgcomp: $(objs) libjpeg/libjpeg.a
	${CC} -o imgcomp $(objs) libjpeg/libjpeg.a

blink_camera_led: blink_camera_led.c
	$(CC) -o blink_camera_led blink_camera_led.c


clean:
	rm -f $(objs) imgcomp

