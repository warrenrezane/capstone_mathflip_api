const express = require("express");
const admin = require("firebase-admin");
const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mathflip_admin = admin.initializeApp(
  {
    credential: admin.credential.cert(
      require("./keys/mathflip-e24a1-firebase-adminsdk-qcyu8-bf2c0bb9ce.json")
    ),
    databaseURL:
      "https://mathflip-e24a1-default-rtdb.asia-southeast1.firebasedatabase.app",
  },
  "mathflip_admin"
);

const mathflip_for_teachers_admin = admin.initializeApp(
  {
    credential: admin.credential.cert(
      require("./keys/mathflip-for-teachers-firebase-adminsdk-j0nwl-461938179b.json")
    ),
  },
  "mathflip_for_teachers"
);

app.post("/api/teacher/create", (req, res) => {
  const { username, name, password } = req.body;

  mathflip_for_teachers_admin
    .auth()
    .createUser({
      email: `${username}@mathflip-for-teachers.firebaseapp.com`,
      password: password,
      displayName: name,
    })
    .then((teacher) => {
      res.status(201).json({
        status: 201,
        message: "Teacher account successfully created.",
      });
    })
    .catch((error) => {
      res.status(400).json(error);
    });
});

app.post("/api/student/create", (req, res) => {
  const { username, name, password, teacherID } = req.body;

  mathflip_admin
    .auth()
    .createUser({
      email: `${username}@mathflip-e24a1.firebaseapp.com`,
      password: password,
      displayName: name,
      photoURL:
        "https://firebasestorage.googleapis.com/v0/b/mathflip-e24a1.appspot.com/o/male_avatar.png?alt=media&token=b21f015c-1458-48d2-8df9-68b3bfd42397",
    })
    .then((student) => {
      mathflip_admin
        .firestore()
        .collection("students")
        .doc(student.uid)
        .set({
          activities: [
            {
              description: "Visualizing Numbers up to 100 000 (Part 1)",
              id: 1,
              is_completed: false,
              items: 4,
              score: 0,
            },
            {
              description: "Visualizing Numbers up to 100 000 (Part 2)",
              id: 2,
              is_completed: false,
              items: 4,
              score: 0,
            },
            {
              description: "Place Value and Value of a Digit",
              id: 3,
              is_completed: false,
              items: 10,
              score: 0,
            },
            {
              description: "Reading and Writing Numbers",
              id: 4,
              is_completed: false,
              items: 6,
              score: 0,
            },
            {
              description: "Rounding Numbers",
              id: 5,
              is_completed: false,
              items: 5,
              score: 0,
            },
            {
              description: "Comparing Numbers using Relational Symbols",
              id: 6,
              is_completed: false,
              items: 10,
              score: 0,
            },
            {
              description: "Ordering Numbers (Ascending & Descending)",
              id: 7,
              is_completed: false,
              items: 10,
              score: 0,
            },
          ],
          avatar: student.photoURL,
          current_activity: "None",
          last_activity: "None",
          firstname: student.displayName.split(" ")[0],
          lastname: student.displayName.split(" ")[1],
          teacherID,
        });

      mathflip_admin.database().ref("status").child(student.uid).set({
        presence: "offline",
      });

      res.status(201).json({
        status: 201,
        message: "Student account successfully created.",
      });
    })
    .catch((error) => {
      res.status(400).json(error);
    });
});

app.listen(port, () => console.log(`Server started on port ${port}.`));
