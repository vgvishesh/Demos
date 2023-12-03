// script.js
document.addEventListener("DOMContentLoaded", function () {
  // Function to handle form submission
  function handleSubmit(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the value from the input box
    var question = document.getElementById("question-box").value;

    // Call the function to process the question and update the answer
    sendApiRequest(question);
  }

  // Function to process the question and update the answer
  async function sendApiRequest(question) {
    // Replace 'YOUR_OPENAI_API_KEY' with your actual OpenAI API key
    var apiKey = 'YOUR_OPENAI_API_KEY';

    // OpenAI API endpoint
    var sseUrl = 'https://api.openai.com/v1/chat/completions';

    // Prepare the request payload
    var payload = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: question
        }
      ],
      stream: true,
    };

    // Send the API request with streaming
    var response = await fetch(sseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(payload)
    });

    // Check if the response is a successful HTTP response (status code 2xx)
    if (response.ok) {
      // Create a ReadableStream from the response body
      var stream = response.body;

      // Create a TextDecoder to convert the stream chunks to text
      var decoder = new TextDecoder();

      // Read and process chunks of the streaming response
      var reader = stream.getReader();
      var result = '';
      while (true) {
        var { done, value } = await reader.read();

        // Break the loop if the streaming is done
        if (done) {
          break;
        }

        // Convert the chunk to text and update the result
        const responseData = decoder.decode(value);
        const dataChunks = responseData.split('\n').filter(line => line.trim() !== '');
        dataChunks.forEach(element => {
          try {
            const dataString = element.replace(/^data: /, '');
            const parsedDataString = JSON.parse(dataString);
            const answer = parsedDataString.choices[0].delta.content;
            if (answer) {
              result += answer;
              document.getElementById('answer').textContent = result;
            }
          } catch (err) {
            console.log(err);
          }
        })
      }
    } else {
      console.error('Error with API request. HTTP Status:', response.status);
      // Handle the error appropriately (e.g., display an error message)
    }

  }

  document.querySelector("form").addEventListener("submit", handleSubmit);
});
