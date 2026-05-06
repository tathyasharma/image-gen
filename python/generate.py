import sys
import base64
import torch
from diffusers import StableDiffusionPipeline
from io import BytesIO

def generate_image(prompt: str) -> str:
    """
    Generate an image from a text prompt using Stable Diffusion.
    Returns the image as a base64-encoded string.
    """
   model_id = "stabilityai/stable-diffusion-xl-base-1.0"

    # Load pipeline - uses GPU if available, else CPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32

    pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=dtype
    )
    pipe = pipe.to(device)

    # Generate the image
    image = pipe(prompt, num_inference_steps=30).images[0]

    # Convert to base64
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return img_base64


if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "a beautiful sunset over mountains"
    result = generate_image(prompt)
    print(result)  # Node.js reads this output