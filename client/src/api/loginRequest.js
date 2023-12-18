const API_URL = import.meta.env.VITE_API_URL;

export default (username, password) => {
  return fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  }).then((response) => {
    console.log(response);
    if (!response.ok) {
      // Reject the Promise with the error response
      return new Error("error!");
    }

    return response.json();
  });
};
