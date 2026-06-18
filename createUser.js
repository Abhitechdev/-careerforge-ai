async function createUser() {
  const response = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email_address: ["abhishekrajput08767@gmail.com"],
      password: "kHNzR2Gs5bK7yiq",
      skip_password_checks: true
    })
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

createUser();
