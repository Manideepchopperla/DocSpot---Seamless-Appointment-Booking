import React from "react";
import { Element } from "react-scroll";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { FaHeartbeat, FaUserMd, FaCalendarAlt, FaUsers, FaClipboardList, FaCheckCircle } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { TypeAnimation } from "react-type-animation";

const features = [
  {
    Icon: FaCalendarAlt,
    title: "Real-time Booking",
    desc: "See live availability and secure your slot instantly.",
  },
  {
    Icon: FaUserMd,
    title: "Verified Doctors",
    desc: "Only trusted, board-certified professionals on the platform.",
  },
  {
    Icon: FaHeartbeat,
    title: "Secure Records",
    desc: "HIPAA-compliant data storage keeps your info safe.",
  },
];

const steps = [
  { Icon: FaUsers, label: "Search", text: "Browse verified doctors near you." },
  { Icon: FaClipboardList, label: "Book", text: "Pick a time slot that works best." },
  { Icon: FaCheckCircle, label: "Confirm", text: "Get instant confirmation & reminders." },
];

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-800">
      <Navbar />

      {/* HERO */}
      <Element name="home">
        <section className="min-h-screen flex flex-col-reverse md:flex-row items-center justify-center px-6 pt-28 pb-16 bg-gradient-to-br from-indigo-50 via-white to-blue-100">
          {/* TEXT BLOCK */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold leading-tight"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <TypeAnimation
                sequence={["Seamless ", 800, "Seamless Healthcare ", 800, "Seamless Healthcare Online", 1200]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="text-blue-600"
              />
            </motion.h1>
            <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-xl mx-auto md:mx-0">
              Book, manage, and track your doctor appointments—anytime, anywhere.
            </p>

            <motion.div
              className="mt-10 flex gap-6 justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                Login
              </a>
              <a href="/register" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
                Register
              </a>
            </motion.div>
          </div>

          {/* IMAGE BLOCK */}
          <div className="flex-1 mb-8 md:mb-0 flex justify-center">
            <motion.img
              src="/Doctor.png"
              alt="Doctor illustration"
              className="rounded-3xl w-72 md:w-96"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />
          </div>
        </section>
      </Element>

      {/* FEATURES */}
      <Element name="features">
        <section className="py-24 bg-white">
          <h2 className="text-4xl font-bold text-center mb-16 text-blue-700">Why Choose DocSpot?</h2>
          <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-3 px-6">
            {features.map(({ Icon, title, desc }, i) => (
              <Tilt key={i} tiltMaxAngleX={6} tiltMaxAngleY={6}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="p-8 bg-indigo-50 rounded-3xl shadow-xl text-center"
                >
                  <Icon className="mx-auto mb-4 text-4xl text-blue-600" />
                  <h3 className="mb-2 text-xl font-semibold text-blue-700">{title}</h3>
                  <p className="text-gray-600">{desc}</p>
                </motion.div>
              </Tilt>
            ))}
          </div>
        </section>
      </Element>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <h2 className="text-4xl font-bold text-center mb-14 text-blue-700">How It Works</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          {steps.map(({ Icon, label, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white shadow-lg rounded-3xl p-6 text-center"
            >
              <Icon className="text-blue-600 text-4xl mb-4 mx-auto" />
              <h4 className="font-bold text-lg text-blue-700 mb-2">{label}</h4>
              <p className="text-gray-600">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COUNTERS */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3 text-center px-6">
          {[
            { label: "Patients Served", end: 12000 },
            { label: "Doctors Listed", end: 850 },
            { label: "Appointments Booked", end: 54000 },
          ].map(({ label, end }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="rounded-xl bg-indigo-50 p-8 shadow text-blue-700"
            >
              <div className="text-5xl font-bold mb-2">
                <CountUp end={end} duration={2} separator="," />
                +
              </div>
              <p className="text-lg font-medium">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Element name="testimonials">
        <section className="py-24 bg-gradient-to-r from-indigo-50 to-blue-100">
          <h2 className="text-4xl font-bold text-center mb-16 text-blue-700">What Patients Say</h2>
          <div className="max-w-4xl mx-auto grid gap-10 md:grid-cols-2 px-6">
            {[1, 2].map((id) => (
              <motion.div
                key={id}
                whileInView={{ opacity: 1, translateY: 0 }}
                initial={{ opacity: 0, translateY: 50 }}
                transition={{ duration: 0.6 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <p className="italic mb-4 text-gray-700">
                  “DocSpot made it so easy to find the right doctor and schedule my appointment in minutes!”
                </p>
                <h4 className="font-bold text-blue-700">— Happy Patient</h4>
              </motion.div>
            ))}
          </div>
        </section>
      </Element>

      {/* FOOTER */}
      <Element name="contact">
        <footer className="py-12 bg-blue-600 text-white text-center">
          © {new Date().getFullYear()} DocSpot · All rights reserved
        </footer>
      </Element>
    </div>
  );
}
