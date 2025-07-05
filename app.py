import os
import psycopg2


# root_cert_path = os.path.expanduser("root.crt")
# conn = psycopg2.connect("postgresql://jayanth:Co_bSAEk1O1MwwSm4vlYdQ@cinematicodessey-8910.8nk.gcp-asia-southeast1.cockroachlabs.cloud:26257/mysql?sslmode=verify-full")
conn = psycopg2.connect(
    database='mysql',
    user='jayanth',
    password='Co_bSAEk1O1MwwSm4vlYdQ',
    host='cinematicodessey-8910.8nk.gcp-asia-southeast1.cockroachlabs.cloud',
    port='26257',
    sslmode='verify-full',  # Make sure to adjust SSL mode as needed
    sslrootcert='root.crt'  # Provide the path to your CA certificate
)

cur=conn.cursor()
cur.execute("USE mysql;")
cur.close()


from flask import Flask, request, jsonify, render_template,send_file
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import cv2 as cv
import base64
from PIL import Image
from io import BytesIO
import json
from moviepy.editor import ImageClip, concatenate_videoclips, AudioFileClip, CompositeVideoClip
from moviepy.audio.fx.all import audio_loop
from moviepy.editor import *
from moviepy.video.fx import *
from PIL import Image
import numpy as np
import io
import tempfile
import os


app = Flask(__name__)
app.config['TIMEOUT'] = 1800
app.config['JWT_SECRET_KEY'] = 'super-secret'
# mysql = MySQL(app)
jwt = JWTManager(app)

@app.route('/')
def view():
    return render_template("index.html")

@app.route('/authentication_page')
def authentication_page():
    return render_template("authentication.html")

@app.route('/admin_page')
def admin():
    cur = conn.cursor()
    cur.execute("SELECT * FROM Users")
    users = cur.fetchall()
    # for user in users:
    #     print(user[0])
    #     print(user[1])
    #     print(user[2])
    return render_template("admin.html",users=users)


@app.route('/upload_page')
def upload_page():
    return render_template("upload1.html")

@app.route('/home_page')
def home_page():
    try:
        return render_template('homepage.html')

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/video_cus_page')
def video_cus_page():
    return render_template("video_cus.html")


@app.route('/display_vid')
def display_vid():
    return render_template("video.html")
# Route for user registration

@app.route('/signup', methods=['POST'])
def signup():
    cur = conn.cursor()
    username = request.json['username']
    name = request.json['name']
    email = request.json['email']
    password = request.json['password']
    print(username+name+email+password)
    cur.execute("INSERT INTO Users (Username, Name, Email, Password) VALUES (%s, %s, %s, %s)", (username, name, email, password))
    conn.commit()
    cur.close()
    return jsonify({"message": "User registered successfully"}), 200

# Route for user login
@app.route('/login', methods=['POST'])
def login():
    username = request.json['username']
    password = request.json['password']
    # print("going to login"+username+password)
    if(username == 'admin' and password == 'admin'):
        print("admin")
        return jsonify(admin = 'admin'), 200
    else:
        cur = conn.cursor()
        cur.execute("SELECT * FROM Users WHERE Username = %s AND Password = %s", (username, password))
        result = cur.fetchall()
        if len(result) > 0:
            print("it is somehow working")
            access_token = create_access_token(identity=username)
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401

# Protected route
@app.route('/protected', methods=['POST'])
@jwt_required()
def protected():
    # print('entering')
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@app.route('/upload', methods=['POST'])
def upload():
    # print("hi")
    try:
        files = request.files.getlist('files')
        username = request.form['username']  # Parse JSON data sent from frontend
        # username = username['sub']
        # print(username)
        # print(files)
        cur = conn.cursor()
        for file in files:
            name = file.filename
            image_bytes = file.read()
            extension = file.content_type
            size = len(image_bytes)
            cur.execute("INSERT INTO images (username, image_blob, name, extension, size) VALUES (%s,%s, %s, %s, %s)",
                           (username,image_bytes, name, extension, size))
        # Connect to MySQL database

        # Commit the transaction
        conn.commit()
        cur.close()

        return jsonify({'message': 'Images uploaded successfully'}), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/display_images', methods=['GET', 'POST'])
def display_images():
    try:
        username = request.json['username']
        print(username)
        cur = conn.cursor()
        cur.execute("SELECT * FROM images where username = %s",(username,))
        images = cur.fetchall()
        upload_images=[]
        for image in images:
            encoded_image = base64.b64encode(image[1]).decode('utf-8')
            upload_images.append((f"name:{image[2]}",f"data:{image[3]};base64,{encoded_image}"))

        cur.close()
        
        # Pass the images to the template for rendering
        return jsonify(upload_images)

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    
@app.route('/video_make', methods=['GET', 'POST'])
def make_video():
    try:
        img_sources = request.form.getlist('imgsrc')
        transefx= request.form.get('transfx')
        dur= request.form.get('duration')
        dur= float(dur)
        song_name= request.form.get('audio')
        cur = conn.cursor()
        cur.execute("SELECT audio from music where name = %s",(song_name,))
        song = cur.fetchone()
        conn.commit()
        cur.close()
        quality= request.form.get('quality')
        quality = int(quality)
        # print(transefx)
        
        # print('iukvsdbksbks',song[0])

        video_clips = []
        for image in img_sources:
            x=image.split(",")
            base64_string = x[1]

            # Decode the Base64 string
            decoded_data = base64.b64decode(base64_string)
            img = Image.open(BytesIO(decoded_data))
            img = img.resize((640, 480))  # Adjust dimensions as needed
            # Convert PIL Image to numpy array
            img_array = np.array(img)
            clip = ImageClip(img_array, duration=dur)
            video_clips.append(clip)
        
        audio_path = 'audio.mp3'
        with open(audio_path,'wb') as song_file:
            song_file.write(song[0])
        # Function to create video
        total_duration = sum([clip.duration for clip in video_clips])

        print(total_duration)
        
        # Apply transition effects between all clips
        for i, clip in enumerate(video_clips):
            print(f"Clip {i+1}: Duration = {clip.duration}")


        clips_with_transitions = []
        for i, clip in enumerate(video_clips):
            # Apply transition to all clips except the last one
            # if i != len(video_clips) - 1:
            transition_duration = 1  # Adjust transition duration as needed
                # Apply transition to the clip
            if transefx=='fade':
                transition_clip = CompositeVideoClip([clip.fx(transfx.fadein, duration=transition_duration)])
            elif transefx=='slide':
                transition_clip = CompositeVideoClip([clip.fx(transfx.slide_in, duration=transition_duration,side='left')])
            clips_with_transitions.append(transition_clip)
            # Add a blank clip as a transition between consecutive clips
            blank_clip_duration = 0  # Adjust blank clip duration as needed
            blank_clip = ColorClip(size=clip.size, color=(0, 0, 0), duration=blank_clip_duration)
            clips_with_transitions.append(blank_clip)
            # Append the last clip without any transition
            # else:
            #     clips_with_transitions.append(clip)
    #####################################################################################################
            # Create final video clip
        final_clip = concatenate(clips_with_transitions,padding = 0)
            
            # Adjust audio clip if provided
        if audio_path:
            audio_clip = AudioFileClip(audio_path)
            # If audio duration is longer than total video duration, trim the audio
            if audio_clip.duration > total_duration:
                audio_clip = audio_clip.subclip(0, total_duration)
            # If audio duration is shorter than total video duration, loop the audio
            elif audio_clip.duration < total_duration:
                audio_clip = audio_loop(audio_clip, duration=total_duration)
            
            final_clip = final_clip.set_audio(audio_clip)
        else:
            final_clip = final_clip.set_audio(None)
            
        output_path = 'static/output_video.mp4'
        print("Final Clip: ", final_clip)

        final_clip = final_clip.resize(height=quality)
        final_clip.write_videofile(output_path, codec='libx264', fps=24)  # Set the fps value as needed
            # return output_path

        print("Video created:", output_path)



        return output_path
    
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run()


