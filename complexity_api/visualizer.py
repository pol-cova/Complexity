from manim import *
import numpy as np
import io
import sys
import tempfile
import sympy as sp
import os
from typing import Any


def is_safe_function(f, test_points=None):
    if test_points is None:
        test_points = [complex(x, y) for x in [-1, 0, 1] for y in [-1, 0, 1]]

    try:
        for z in test_points:
            result = f(z)
            if isinstance(result, (complex, float, int)):
                if abs(result) > 1e10:
                    return False
            else:
                return False
        return True
    except Exception:
        return False


def generate_animation(parsed_function: Any) -> io.BytesIO:
    z = sp.Symbol('z')
    f = sp.lambdify(z, parsed_function, modules=['numpy', 'sympy'])

    if not is_safe_function(f):
        raise ValueError("Function might lead to unstable behavior or infinite values")

    video_buffer = io.BytesIO()

    class ComplexFunction3DScene(ThreeDScene):
        def construct(self):
            axes = ThreeDAxes(
                x_range=[-3, 3, 1],
                y_range=[-3, 3, 1],
                z_range=[-3, 3, 1],
                axis_config={"include_numbers": True},
            ).scale(0.8)

            self.set_camera_orientation(phi=60 * DEGREES, theta=45 * DEGREES)
            self.begin_ambient_camera_rotation(rate=0.2)
            self.play(Create(axes), run_time=1)

            def transform_func(x, y):
                z_val = complex(x, y)
                try:
                    result = f(z_val)
                    if isinstance(result, (complex, float)):
                        magnitude = abs(result)
                        if magnitude > 3:
                            magnitude = 3 * (1 + np.log(magnitude/3))
                        return [x, y, magnitude]
                except Exception:
                    return [x, y, 0]

            surface = Surface(
                lambda u, v: axes.c2p(*transform_func(u, v)),
                u_range=[-3, 3],
                v_range=[-3, 3],
                resolution=(100, 100),
                checkerboard_colors=[BLUE_D, BLUE_E],
                stroke_width=0.1,
                stroke_opacity=0.3,
                fill_opacity=0.8,
            )

            self.play(Create(surface), run_time=2)
            self.wait(2)
            self.stop_ambient_camera_rotation()

    config.media_width = "75%"
    config.pixel_height = 720
    config.pixel_width = 1280
    config.frame_rate = 30
    config.quality = "medium_quality"
    config.output_file = "scene"

    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            media_dir = os.path.join(tmpdir, "media", "videos", "720p30")
            os.makedirs(media_dir, exist_ok=True)
            
            config.media_dir = tmpdir
            
            with open(os.devnull, 'w') as devnull:
                sys.stdout = devnull
                sys.stderr = devnull
                scene = ComplexFunction3DScene()
                scene.render()
            
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__
            
            expected_path = os.path.join(media_dir, "scene.mp4")
            if os.path.exists(expected_path):
                with open(expected_path, "rb") as video_file:
                    video_buffer.write(video_file.read())
            else:
                video_file_path = ""
                for root, _, files in os.walk(tmpdir):
                    for file in files:
                        if file.endswith(".mp4"):
                            video_file_path = os.path.join(root, file)
                            break
                if video_file_path:
                    with open(video_file_path, "rb") as video_file:
                        video_buffer.write(video_file.read())
                else:
                    raise Exception("Video file not found in any subdirectory")

        except Exception as e:
            raise Exception(f"Error generating video: {str(e)}")
        finally:
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

    video_buffer.seek(0)
    return video_buffer