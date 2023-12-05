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
    if (!response.ok) {
      // Reject the Promise with the error response
      return response.json().then((data) => Promise.reject(data));
    }
    return response.json();
  });
};
