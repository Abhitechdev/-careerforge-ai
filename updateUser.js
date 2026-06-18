async function manageUser() {
  const getRes = await fetch("https://api.clerk.com/v1/users?email_address=abhishekrajput08767@gmail.com", {
    headers: {
      "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
    }
  });
  const data = await getRes.json();
  if (!data || data.length === 0) {
    console.log("User not found");
    return;
  }
  const userId = data[0].id;
  
  const updateRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      password: "kHNzR2Gs5bK7yiq",
      skip_password_checks: true
    })
  });
  const updateData = await updateRes.json();
  console.log("Updated", updateData.id);
}
manageUser();
