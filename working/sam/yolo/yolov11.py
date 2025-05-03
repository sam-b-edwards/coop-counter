from ultralytics import YOLO

model = YOLO("yolo11n.pt")

def callback_function():
    pass

model.add_callback("on_pretrain_routine_start", callback_function)
# See docs page on callbacks https://docs.ultralytics.com/usage/callbacks/ for more information