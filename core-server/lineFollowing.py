import time
from XRPLib.defaults import *

def line_track():
    base_effort = 0.3
    
    KP = 0.6
    KI = 0.01
    KD = 0.08
    
    integral = 0
    previous_error = 0

    no_line_count = 0   # NEW
    
    while not board.is_button_pressed():

        left = reflectance.get_left()
        right = reflectance.get_right()

        # NEW: detect line loss faster (not waiting for full white)
        if left < 0.4 and right < 0.4:
            no_line_count += 1
        else:
            no_line_count = 0 

        # STOP immediately after a few confirmations (very fast)
        if no_line_count >= 2:
            drivetrain.set_effort(0, 0)
            break
        
        error = right - left
        
        integral += error
        integral = max(min(integral, 100), -100)
        
        derivative = error - previous_error
        
        correction = (KP * error + KI * integral + KD * derivative)
        
        drivetrain.set_effort(
            base_effort - correction,
            base_effort + correction
        )
        
        previous_error = error
        
        print(f"Error: {error}, Correction: {correction}")
        time.sleep(0.01)
        
def stop():
    drivetrain.set_effort(0,0)



