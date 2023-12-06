const API_URL = import.meta.env.VITE_API_URL;

export default () => {
  return fetch(`${API_URL}/api/create_link_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (!response.ok) {
      // Reject the Promise with the error response
      return response.json().then((data) => Promise.reject(data));
    }
    return response.json();
  });
};
