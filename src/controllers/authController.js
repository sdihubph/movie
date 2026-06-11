import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  //check if user exist
  const userExists = await prisma.user.findUnique({
    where: {email: email},
  });
  if (userExists) {
    return res
      .status(400)
      .json({error: "User already exist with this email!"});
  }

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  //generate token
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: name,
        email: email,
        password: hashedPassword,
      },
      token,
    }
  });
};

const login = async(req, res) => {
  const {email, password} = req.body;

  // check if user already exist
  const user = await prisma.user.findUnique({
    where: { email: email},
  });

  if (!user) {
    return res.status(401).json({error: "Invalid email or password!"});
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({error: "Invalid email or password!"});
  }

  //generate token
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: email,
      },
      token,
    }
  });  
};

const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out Successfuly",
  });
}

export {
  register,
  login,
  logout
};