(() => {
  const nav = document.querySelector('nav[aria-label="Main navigation"]');
  if (!nav) return;

  const link = document.createElement("a");
  // Change this path if the church app's home page uses a different route.
  link.href = "/";
  link.textContent = "← Church app home";
  link.setAttribute("aria-label", "Return to church app home");
  Object.assign(link.style, {
    background: "#fff",
    border: "1px solid #b8c4ba",
    borderRadius: "7px",
    color: "#183e35",
    padding: "8px",
    textDecoration: "none",
  });
  nav.prepend(link);
})();
