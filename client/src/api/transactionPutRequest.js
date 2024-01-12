const API_URL = import.meta.env.VITE_API_URL;

export default (modifiedName, transactionID) => {
  return fetch(`${API_URL}/transaction/${transactionID}/put`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      modifiedName,
    }),
  }).then((response) => {
    if (!response.ok) {
      // Reject the Promise with the error response
      return response.json().then((data) => Promise.reject(data));
    }

    return response.json();
  });
};
