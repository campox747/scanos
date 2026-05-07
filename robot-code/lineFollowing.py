import time
from XRPLib.defaults import *

class LineFollower:
    def __init__(self):
        self.following = False
        self.base_effort = 0.35
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
        
    def return_home(self):
        
        left = reflectance.get_left()
        right = reflectance.get_right()
        print(left, right)
        
        if left < 0.700 and right < 0.700:
            return
        else:
            home_confidence = 0
        
            #turning 180 degrees
            #print("Turning 180...")
            #drivetrain.set_effort(0.7, -0.7)
            #time.sleep(1.3)
            #drivetrain.set_effort(0, 0)
            #print("Turn complete")
            
            # 1. Start the turn
            print("Turning until line detected...")
            drivetrain.set_effort(0.7, -0.7)
            start_time = time.time()
            timeout = 3.0 

            # PHASE 1: Wait for sensors to drop (getting OFF the current line)
            print("Clearing current position...")
            while True:
                left_val = reflectance.get_left()
                right_val = reflectance.get_right()
    
                # We wait until the sensors are low (< 0.6)
                if left_val < 0.6 and right_val < 0.6:
                    print("Left the starting position.")
                    break
        
                if time.time() - start_time > timeout:
                    break
                time.sleep(0.01)

            # PHASE 2: Wait for sensors to hit the target (finding the NEW line)
            print("Searching for target...")
            while True:
                left_val = reflectance.get_left()
                right_val = reflectance.get_right()
    
                # Now we look for the high signal
                if left_val > 0.700 and right_val > 0.700:
                    print("Target detected!")
                    break
    
                if time.time() - start_time > timeout:
                    print("Timeout reached.")
                    break
        
                time.sleep(0.01)

            # 3. Stop the robot
            drivetrain.set_effort(0, 0)
            print("Turn complete")

            while home_confidence != 5:
                left = reflectance.get_left()
                right = reflectance.get_right()
                print(home_confidence)
                self.line_track()
                print(left, right)
                if left < 0.680 and right < 0.680:
                    home_confidence = home_confidence + 1
                else:
                    home_confidence = 0
                    
                time.sleep(0.01)
        
            home_confidence = 0
            print("Turning 180...")
            drivetrain.set_effort(0.7, -0.7)
            time.sleep(1.3)
            drivetrain.set_effort(0, 0)
            print ("Turn Complete")
            print("Reached Home")
            
            return
            
            


    def get_status(self):
        return self.following
