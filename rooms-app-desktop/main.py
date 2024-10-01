import socketio
import requests
from tkinter import Tk, Label, Button, StringVar, Listbox, Frame, ttk
from pynput import keyboard
import pyautogui

baseURL = 'http://147.79.115.171:5000'

sio = socketio.Client()

mapped_coords = {"button1": None, "button2": None}
selected_room = None
mapping_in_progress = False
current_mapping_button = None

# Function to perform click at specified coordinates
def perform_click(x, y):
    current_pos = pyautogui.position()
    pyautogui.click(x, y)
    pyautogui.moveTo(current_pos)  # Move back to original position

# Register event listeners for volume up and volume down
@sio.on('volume_up')
def on_volume_up():
    print("Received volume_up event")
    if mapped_coords["button1"]:
        perform_click(*mapped_coords["button1"])

@sio.on('volume_down')
def on_volume_down():
    print("Received volume_down event")
    if mapped_coords["button2"]:
        perform_click(*mapped_coords["button2"])

# Function to handle login to room
def login_to_room():
    username = username_var.get()
    password = password_var.get()

    # Perform login request
    response = requests.post(f"{baseURL}/api/auth/login", json={
        "username": username,
        "password": password
    })

    if response.status_code == 200:
        token = response.json().get('token')
        fetch_assigned_rooms(token)
        status_label.config(text="Login Successful", foreground="green")
    else:
        status_label.config(text="Login Failed", foreground="red")

# Fetch assigned rooms for the user
def fetch_assigned_rooms(token):
    response = requests.get(f"{baseURL}/api/room/get-user-assigned-room", headers={
        'Authorization': f'Bearer {token}'
    })

    if response.status_code == 200:
        global assigned_rooms
        assigned_rooms = response.json()['rooms']
        update_room_list()
        login_frame.pack_forget()
        room_frame.pack(side="left", fill="both", expand=True, padx=20, pady=20)

# Update room list after login
def update_room_list():
    room_listbox.delete(0, 'end')
    for room in assigned_rooms:
        room_listbox.insert("end", room['name'])
    
    confirm_button.config(state="normal")

# Function to handle room selection and confirmation
def confirm_room():
    global selected_room
    selected_room_index = room_listbox.curselection()
    if selected_room_index:
        selected_room = assigned_rooms[selected_room_index[0]]
        show_room_controls(selected_room['id'])
    else:
        status_label.config(text="Please select a room first", foreground="red")

# Function to capture mouse coordinates when F12 is pressed
def on_key_press(key):
    global mapping_in_progress, current_mapping_button
    if key == keyboard.Key.f12 and mapping_in_progress:
        x, y = pyautogui.position()
        mapped_coords[current_mapping_button] = (x, y)
        mapping_in_progress = False
        root.after(0, update_button_labels)
        root.after(0, lambda: instruction_label.config(text="Button Mapping"))

# Update button labels with mapped coordinates
def update_button_labels():
    for button_key in ["button1", "button2"]:
        label = button1_label if button_key == "button1" else button2_label
        coords = mapped_coords[button_key]
        if coords:
            label.config(text=f"{button_key.capitalize()} Coordinates: {coords[0]}, {coords[1]}")
        else:
            label.config(text=f"{button_key.capitalize()} Coordinates: Not Mapped")

# Function to show room controls and map buttons
def show_room_controls(room_id):
    room_frame.pack_forget()
    mapping_frame.pack(side="left", fill="both", expand=True, padx=20, pady=20)

    # Connect to socket
    username = username_var.get()  # Get the username from login
    try:
        sio.connect(baseURL)
        sio.emit('login', {'username': username, 'deviceType': 'desktop'})  # Pass username and device type
        sio.emit('joinRoom', room_id)
        status_label.config(text="Connected to room", foreground="green")
        print(f"Connected to room {room_id} as {username}")
    except Exception as e:
        status_label.config(text=f"Failed to connect: {str(e)}", foreground="red")
        print("Connection failed:", e)

# Tkinter GUI Layout
root = Tk()
root.title("Remote Control Desktop App")
root.geometry("800x600")
root.configure(bg="#f0f0f0")

# Login Frame
login_frame = ttk.Frame(root, padding="20")
login_frame.pack(fill="both", expand=True)

ttk.Label(login_frame, text="Remote Control Desktop App", font=("Arial", 18, "bold")).pack(pady=20)

ttk.Label(login_frame, text="Username").pack()
username_var = StringVar()
ttk.Entry(login_frame, textvariable=username_var, width=30).pack(pady=5)

ttk.Label(login_frame, text="Password").pack()
password_var = StringVar()
ttk.Entry(login_frame, textvariable=password_var, show="*", width=30).pack(pady=5)

ttk.Button(login_frame, text="Login", command=login_to_room).pack(pady=10)

status_label = ttk.Label(login_frame, text="", font=("Arial", 12))
status_label.pack(pady=10)

# Room Selection Frame
room_frame = ttk.Frame(root, padding="20")

ttk.Label(room_frame, text="Select a Room", font=("Arial", 16, "bold")).pack(pady=10)
room_listbox = Listbox(room_frame, width=40, height=10)
room_listbox.pack(pady=10)

confirm_button = ttk.Button(room_frame, text="Confirm Room", command=confirm_room, state="disabled")
confirm_button.pack(pady=10)

# Button Mapping Frame
mapping_frame = ttk.Frame(root, padding="20")

instruction_label = ttk.Label(mapping_frame, text="Button Mapping", font=("Arial", 16, "bold"))
instruction_label.pack(pady=10)

button1_label = ttk.Label(mapping_frame, text="Button 1 Coordinates: Not Mapped", font=("Arial", 12))
button1_label.pack(pady=5)

button2_label = ttk.Label(mapping_frame, text="Button 2 Coordinates: Not Mapped", font=("Arial", 12))
button2_label.pack(pady=5)

def start_mapping(button_key):
    global mapping_in_progress, current_mapping_button
    mapping_in_progress = True
    current_mapping_button = button_key
    instruction_label.config(text=f"Move mouse to desired location and press F12 to map {button_key.capitalize()}")

ttk.Button(mapping_frame, text="Map Button 1", command=lambda: start_mapping("button1")).pack(pady=5)
ttk.Button(mapping_frame, text="Map Button 2", command=lambda: start_mapping("button2")).pack(pady=5)

def reset_coordinates():
    global mapped_coords
    mapped_coords = {"button1": None, "button2": None}
    update_button_labels()

ttk.Button(mapping_frame, text="Reset Coordinates", command=reset_coordinates).pack(pady=10)

# Start the keyboard listener
keyboard_listener = keyboard.Listener(on_press=on_key_press)
keyboard_listener.start()

root.mainloop()
