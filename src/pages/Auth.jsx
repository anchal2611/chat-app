import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { auth, db } from "../firebase/firebaseConfig";

import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

export default function Auth() {

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const [flip,setFlip] = useState(false);

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");

  const [name,setName] = useState("");
  const [gender,setGender] = useState("");
  const [dob,setDob] = useState("");

  const [avatar,setAvatar] = useState("");
  const [captcha,setCaptcha] = useState(null);

  const avatars = [
    "/avatars/1.png",
    "/avatars/2.png",
    "/avatars/3.png",
    "/avatars/4.png"
  ];

  const checkAge = () => {
    const birth = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const m = today.getMonth() - birth.getMonth();

    if(m < 0 || (m === 0 && today.getDate() < birth.getDate())){
      age--;
    }

    return age >= 18;
  };

  const loginGoogle = async () => {

    try{

      const result = await signInWithPopup(auth,provider);
      const user = result.user;

      await setDoc(doc(db,"users",user.uid),{
        uid:user.uid,
        name:user.displayName,
        email:user.email,
        avatar:user.photoURL,
        verified:true,
        createdAt:new Date()
      },{merge:true});

      navigate("/chat");

    }catch(err){
      alert(err.message);
    }

  };

  const loginEmail = async () => {

    try{

      const cred = await signInWithEmailAndPassword(auth,email,password);

      if(!cred.user.emailVerified){
        alert("Please verify your email before logging in.");
        return;
      }

      navigate("/chat");

    }catch(err){
      alert(err.message);
    }

  };

  const signupEmail = async () => {

    if(!captcha){
      alert("Please complete captcha");
      return;
    }

    if(password !== confirmPassword){
      alert("Passwords do not match");
      return;
    }

    if(!checkAge()){
      alert("You must be 18+ to create an account");
      return;
    }

    if(!avatar){
      alert("Please select profile picture");
      return;
    }

    if(!gender){
      alert("Please select gender");
      return;
    }

    try{

      const cred = await createUserWithEmailAndPassword(auth,email,password);
      const user = cred.user;

      await sendEmailVerification(user);

      await setDoc(doc(db,"users",user.uid),{

        uid:user.uid,
        name:name,
        email:email,
        gender:gender,
        dob:dob,
        avatar:avatar || "/avatars/1.png",
        verified:false,
        createdAt:new Date()

      });

      alert("Verification email sent. Please check your inbox.");

      navigate("/auth");

    }catch(err){
      alert(err.message);
    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center px-6">

      <div className="auth-container">

        <div className={`auth-card ${flip ? "flip":""}`}>

          {/* LOGIN */}

          <div className="auth-side bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col justify-center gap-4">

            <h2 className="text-3xl font-bold text-center">
              Welcome Back
            </h2>

            <button onClick={loginGoogle} className="google-btn">

              <FcGoogle size={22}/>
              Continue with Google

            </button>

            <div className="divider">OR</div>

            <input
              className="input"
              placeholder="Email"
              onChange={(e)=>setEmail(e.target.value)}
            />

            <input
              className="input"
              placeholder="Password"
              type="password"
              onChange={(e)=>setPassword(e.target.value)}
            />

            <button onClick={loginEmail} className="btn-primary">

              Login

            </button>

            <p className="text-center text-sm text-gray-400">

              Don't have an account?

              <span
                onClick={()=>setFlip(true)}
                className="text-purple-400 cursor-pointer"
              >
                Sign up
              </span>

            </p>

          </div>


          {/* SIGNUP */}

          <div className="auth-side auth-back bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto signup-scroll">

            <h2 className="text-3xl font-bold mb-6 text-center">
              Create Account
            </h2>

            <button onClick={loginGoogle} className="google-btn">

              <FcGoogle size={22}/>
              Continue with Google

            </button>

            <div className="divider">OR</div>

            <p className="text-sm text-gray-400 text-center mb-2">
              Choose Profile Picture
            </p>

            <div className="flex gap-3 justify-center mb-4">

              {avatars.map((a,i)=>(
                <img
                  key={i}
                  src={a}
                  onClick={()=>setAvatar(a)}
                  className={`w-12 h-12 rounded-full cursor-pointer border transition
                  ${avatar===a ? "border-purple-500 scale-110":"border-transparent hover:border-purple-400"}`}
                />
              ))}

            </div>

            <input
              className="input"
              placeholder="Full Name"
              onChange={(e)=>setName(e.target.value)}
            />

            <input
              className="input"
              placeholder="Email"
              onChange={(e)=>setEmail(e.target.value)}
            />

            <select
              className="input"
              onChange={(e)=>setGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>

            <input
              type="date"
              className="input"
              onChange={(e)=>setDob(e.target.value)}
            />

            <input
              className="input"
              placeholder="Password"
              type="password"
              onChange={(e)=>setPassword(e.target.value)}
            />

            <input
              className="input"
              placeholder="Confirm Password"
              type="password"
              onChange={(e)=>setConfirmPassword(e.target.value)}
            />

            <div className="flex justify-center mt-2">

              <ReCAPTCHA
                sitekey={import.meta.env.VITE_CAPTCHA_SITE_KEY}
                onChange={(value)=>setCaptcha(value)}
              />

            </div>

            <button onClick={signupEmail} className="btn-primary mt-4">

              Sign Up

            </button>

            <p className="text-center text-sm mt-4 text-gray-400">

              Already have an account?

              <span
                onClick={()=>setFlip(false)}
                className="text-purple-400 cursor-pointer"
              >
                Login
              </span>

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}