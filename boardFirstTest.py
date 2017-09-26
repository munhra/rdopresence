import RPi.GPIO as GPIO
import time

# ADDRESSING LOAD PINS 74HCT137
OE_0 = 23
A0 = 2
A1 = 3
A2 = 4

# WORD TO CONTROL 
CLOCK = 27
DATA = 17

# functions
def setupPins():
	
	GPIO.setmode(GPIO.BCM)
	GPIO.setwarnings(False)
	GPIO.setup(18,GPIO.OUT)

	GPIO.setup(OE_0,GPIO.OUT)
	GPIO.setup(A0,GPIO.OUT)
	GPIO.setup(A1,GPIO.OUT)
	GPIO.setup(A2,GPIO.OUT)
	
	#ENSURE THAT ALL ADDRESS ARE HIGH
	GPIO.output(OE_0,GPIO.LOW)
	
	GPIO.setup(CLOCK,GPIO.OUT)
	GPIO.setup(DATA,GPIO.OUT)

	return;
	
# for now just loading last pin Y7

def addressSetLoadPinLow():
	GPIO.output(OE_0,GPIO.HIGH)
	GPIO.output(A0,GPIO.HIGH)
	GPIO.output(A1,GPIO.HIGH)
	GPIO.output(A2,GPIO.HIGH)
	return;
	
# set high in OE_0 to high to set LOAD pin to HIGH

def addressSetLoadPinHigh():
	GPIO.output(OE_0,GPIO.LOW)
	return;

# write data to atenuator to simplify data = 1 on data = 0 off
# check LM1971 datasheet for more info

def writeSoundAtenuatorData(data):
	for i in range (0,8):
		
		if data == 0:
			GPIO.output(DATA,GPIO.LOW)
		else:
			GPIO.output(DATA,GPIO.HIGH)
			
		GPIO.output(CLOCK,GPIO.HIGH)
		time.sleep(0.001) #0.001 seconds
		GPIO.output(CLOCK,GPIO.LOW)
		
		print("send data")
	
	return;
	
# LED CHECK	
def lightControlLED():
	GPIO.setup(18,GPIO.OUT)
	print "LED on"
	GPIO.output(18,GPIO.HIGH)
	time.sleep(5)
	print "LED off"
	GPIO.output(18,GPIO.LOW)
	return;

# Main program
# setup pins to correct purpose and value
setupPins()

# address to the last card J9 in mother board
# LOAD line value will be set to low
addressSetLoadPinLow()

# write atenuator data 0000 0000 to disable te atenuation check LM1971 
# datasheet
writeSoundAtenuatorData(0)

# set HIGH to all address
addressSetLoadPinHigh()

# Light a led to wait
lightControlLED()

# address to the last card J9 in mother board
# LOAD line value will be set to low
addressSetLoadPinLow()

# write atenuator data 0000 0000 to disable te atenuation check LM1971 
# datasheet
writeSoundAtenuatorData(0)

# set HIGH to all address
addressSetLoadPinHigh()
