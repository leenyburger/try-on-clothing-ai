# Virtual Try-On Chrome Extension

This Chrome extension enables users to virtually try on clothing items from any e-commerce website using AI-powered image processing.
![CleanShot 2024-12-13 at 19 51 07@2x](https://github.com/user-attachments/assets/85743d6d-51d1-4985-9819-f33006c77d87)

## Demo

Check out this video demonstration of the Try On Ai Chrome Extension:

https://youtu.be/3xpLw5aAkXo

## Features

- Works on any e-commerce website
- Select your image once and easily reuse it across different websites
- Use SimpleFileUpload with a paid API key to keep and store images for re-use later 

## How It Works

- Captures the product's primary image from HTML using OpenAI GPT-4
- Uploads the person's image to Simple File Upload for easy AI access
- Uses Replicate
- Stores person and result images in browser cache for improved usability


## Technical Installation of Extension

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. Set up the OpenAI key and get a paid SimpleFileUpload key if you want to retain the images 

## Setup

Before using the extension, you need to set up the following:

### OpenAI API Key

1. Go to [OpenAI](https://platform.openai.com/signup) and sign up for an account
2. Navigate to the [API keys page](https://platform.openai.com/account/api-keys)
3. Click "Create new secret key" and copy the generated key

### To retain images outside of demo (not required to try)   

1. Go to [Simple File Upload](https://simplefileupload.com) (paid) and sign up for an account
2. Get your key from the "Quick Start" page
3. Enter your key in the "Settings" section of the chrome extension

## Usage

1. Click the extension icon in Chrome to open the popup
2. Click the settings icon (⚙️) and enter your API keys:
   - OpenAI API Key
3. Save the settings
4. Upload or select a person image
5. Navigate to a product page on an e-commerce website
6. Click "Try On" to see the virtual try-on result

## Tips and Trick
   1. Try different Replicate models to get different results!

## Credits

- https://github.com/shyjal for original idea and code 


## License

This project is licensed under the MIT License.
