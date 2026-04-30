import time
from XRPLib.defaults import *

class LineFollower:
    def __init__(self):
        self.following = False
        self.base_effort = 0.3
        self.KP = 0.6
        self.KI = 0.01
        self.KD = 0.08
        self.integral = 0
        self.previous_error = 0

    def line_track(self):
        left = reflectance.get_left()
        right = reflectance.get_right()
        error = right - left

        self.integral += error
        self.integral = max(min(self.integral, 100), -100)  # fix: was `integral`

        derivative = error - self.previous_error

        correction = (self.KP * error + self.KI * self.integral + self.KD * derivative)  # fix: self.integral, self.base_effort

        drivetrain.set_effort(
            self.base_effort - correction,
            self.base_effort + correction
        )

        self.previous_error = error

    def stop(self):
        self.following = False
        drivetrain.set_effort(0, 0)  # actually stop the motors

    def start(self):
        self.following = True
        # Don't call line_track() here — let the main loop do it

    def get_status(self):
        return self.following
        
    
        
    def return_home(self):
        left = reflectance.get_left()
        right = reflectance.get_right()
        home_confidence = 0
        
        #turning 180 degrees
        print("Turning 180...")
        drivetrain.set_effort(0.5, -0.5)
        time.sleep(1.1)
        drivetrain.set_effort(0, 0)
        print("Turn complete")
        
        while home_confidence != 5:
            lf.line_track()
            if left < 0.738 and left > 0.710 and right < 0.738 and right > 0.710:
                home_confidence = home_confidence + 1
        
        print("Turning 180...")
        drivetrain.set_effort(0.5, -0.5)
        time.sleep(1.2)
        drivetrain.set_effort(0, 0)
        print("Turn complete")
        
        
lf = LineFollower()
lf.start()

has_returned = False

while True:
    if lf.get_status() and not has_returned:
        lf.return_home()
        has_returned = True

    time.sleep(0.01)
