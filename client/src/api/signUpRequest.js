const API_URL = import.meta.env.VITE_API_URL;

export default (firstName, lastName, username, password, confirmPassword) => {
  return fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName,
      lastName,
      username,
      password,
      confirmPassword,
    }),
  }).then((response) => {
    if (!response.ok) {
      // Reject the Promise with the error response
      return response.json().then((data) => Promise.reject(data));
    }
    return response.json();
  });
};
