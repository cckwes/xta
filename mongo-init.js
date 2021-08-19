db.createUser({
  user: "xta",
  pwd: "password",
  roles: [
    {
      role: "readWrite",
      db: "agenda",
    },
  ],
});
