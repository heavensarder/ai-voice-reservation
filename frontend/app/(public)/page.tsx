'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Star,
  ChefHat,
  ArrowRight,
  Coffee
} from 'lucide-react';
import VoiceAgent from "@/components/VoiceAgent";
import ReservationModal from '@/components/ReservationModal';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openReservation = () => setIsReservationOpen(true);
  const closeReservation = () => setIsReservationOpen(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500/20">

      {/* --- Navigation --- */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${isScrolled ? 'bg-emerald-100 text-emerald-600' : 'bg-white/20 text-white backdrop-blur-md'}`}>
              <UtensilsCrossed size={24} />
            </div>
            <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
              Bhojone<span className="text-emerald-500">.</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            {['Home', 'About', 'Menu', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`transition-colors hover:text-emerald-500 ${isScrolled ? 'text-slate-600' : 'text-white/90'}`}
              >
                {item}
              </Link>
            ))}
          </div>

          <button
            onClick={openReservation}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${isScrolled
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
              : 'bg-white text-slate-900 hover:bg-gray-100'
              }`}
          >
            Book a Table
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80"
            alt="Restaurant Interior"
            fill
            sizes="100vw"
            className="object-cover brightness-[0.6]" // Darken for text readability
            priority
          />
        </div>

        <div className="container relative z-10 px-4 text-center md:text-left text-white max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-medium mb-4 backdrop-blur-md">
                Establishment since 1998
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
                <span className="text-white">Taste the</span> <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                  Spirit of Bengal
                </span>
              </h1>

            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-200 max-w-xl leading-relaxed"
            >
              Experience authentic Bengali cuisine prepared with passion, traditional spices, and a modern touch. Every dish tells a story of heritage.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={openReservation}
                className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-700 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 group"
              >
                Reserve Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <Link href="#menu" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center">
                View Full Menu
              </Link>
            </motion.div>
          </div>

          {/* Hero Floating Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hidden md:block w-80 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Clock />
              </div>
              <div>
                <p className="text-sm text-gray-300">Opening Hours</p>
                <p className="font-bold">11:00 AM - 11:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white">
                <MapPin />
              </div>
              <div>
                <p className="text-sm text-gray-300">Location</p>
                <p className="font-bold">Banani, Dhaka 1213</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="text-yellow-400 fill-yellow-400 w-4 h-4" />)}
              <span className="text-sm ml-2 font-medium">4.9 (2k+ Reviews)</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="py-20 md:py-32 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
              <Image
                src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                alt="Restaurant Chef"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-1">Master Chef Rafiq</h3>
                <p className="text-emerald-600 font-medium text-sm">25 Years of Experience</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-sm">
                <ChefHat size={20} /> About Us
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                We Invite You to <br />
                <span className="text-emerald-600">Our Journey</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Founded in 1998, Bhojone started as a small family kitchen with a big dream: to bring the authentic, nostalgia-filled flavors of rural Bengal to the heart of the city.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                We source our spices directly from local farmers and grind them in-house. Our fish comes fresh from the river Padma every morning. We believe that good food is not just about taste, it's about the memory it creates.
              </p>
              <button className="text-emerald-600 font-bold hover:text-emerald-700 inline-flex items-center gap-2 border-b-2 border-emerald-600 pb-1">
                Read Our Full Story <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Menu Section --- */}
      <section id="menu" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm block mb-2">Our Menu</span>
            <h2 id="culinary-masterpieces" className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Culinary Masterpieces</h2>
            <p className="text-slate-500 text-lg">A curated selection of authentic Bengali dishes, prepared with love and tradition.</p>
          </div>

          {[
            {
              category: "Rice & Biryani",
              items: [
                {
                  title: "Kachchi Biryani",
                  price: "৳450",
                  desc: "Tender mutton layered with fragrant chinigura rice, potatoes, and exotic spices.",
                  img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80"
                },
                {
                  title: "Morog Polao",
                  price: "৳380",
                  desc: "Classic chicken pilaf cooked with yogurt and mild spices.",
                  img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1772&q=80"
                },
                {
                  title: "Bhuna Khichuri",
                  price: "৳320",
                  desc: "Rich mixture of rice and roasted moong dal, served with beef bhuna.",
                  img: "https://images.unsplash.com/photo-1606471191009-63994c53433b?ixlib=rb-4.0.3&auto=format&fit=crop&w=927&q=80"
                },
                {
                  title: "Steamed Rice & Daal",
                  price: "৳150",
                  desc: "Fluffy white rice served with thick lentil soup and lime.",
                  img: "https://images.unsplash.com/photo-1516684732162-798a0062be99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                }
              ]
            },
            {
              category: "Fish Specialties",
              items: [
                {
                  title: "Ilish Bhapa",
                  price: "৳600",
                  desc: "Hilsa fish steamed to perfection in a rich mustard and green chili sauce.",
                  img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80"
                },
                {
                  title: "Rui Macher Kalia",
                  price: "৳400",
                  desc: "Carp fish cooked in a spicy, rich onion and tomato gravy.",
                  img: "https://images.unsplash.com/photo-1599020792689-9fde458e7e17?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                },
                {
                  title: "Chingri Malai Curry",
                  price: "৳550",
                  desc: "Prawns simmered in a creamy coconut milk gravy.",
                  img: "https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1758&q=80"
                },
                {
                  title: "Chital Muitha",
                  price: "৳380",
                  desc: "Spiced fish dumplings in a golden curry gravy.",
                  img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2620&q=80"
                }
              ]
            },
            {
              category: "Meat Delights",
              items: [
                {
                  title: "Beef Kala Bhuna",
                  price: "৳500",
                  desc: "Traditional dark, slow-cooked beef with aromatic spices.",
                  img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                },
                {
                  title: "Mutton Rezala",
                  price: "৳600",
                  desc: "Mutton stewed in a yogurt-based white gravy with dried chilies.",
                  img: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                },
                {
                  title: "Galouti Kebab",
                  price: "৳320",
                  desc: "Melt-in-mouth minced meat kebabs with exotic spices.",
                  img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80"
                },
                {
                  title: "Chicken Roast",
                  price: "৳250",
                  desc: "Mildly spiced chicken roast, a wedding favorite.",
                  img: "https://images.unsplash.com/photo-1608835291093-394b0c943a75?ixlib=rb-4.0.3&auto=format&fit=crop&w=1772&q=80"
                }
              ]
            },
            {
              category: "Bhorta & Bites",
              items: [
                {
                  title: "Alu Bhorta",
                  price: "৳50",
                  desc: "Mashed potatoes with mustard oil, onions, and dry chilies.",
                  img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                },
                {
                  title: "Shutki Bhorta",
                  price: "৳80",
                  desc: "Spicy dried fish mash for the brave hearted.",
                  img: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                }
              ]
            }
          ].map((section, idx) => (
            <div key={idx} className="mb-20">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px bg-slate-200 flex-1"></div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{section.category}</h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {section.items.map((item, i) => (
                  <div key={i} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-md px-3 py-1 rounded-full text-sm font-bold text-slate-900">
                        {item.price}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center mt-12 bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <p className="text-slate-600 mb-4">Want to see the full list of over 100 items?</p>
            <button className="px-8 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
              Download Full PDF Menu
            </button>
          </div>
        </div>
      </section>

      {/* --- Testimonials --- */}
      <section className="py-20 bg-emerald-900 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/3">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-sm block mb-4">Testimonials</span>
              <h2 className="text-4xl font-extrabold mb-6">What our customers say</h2>
              <p className="text-emerald-100 opacity-80 leading-relaxed mb-8">
                We treat every guest like family. Check out the reviews from our beloved patrons.
              </p>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">15k+</p>
                  <p className="text-xs text-emerald-300 uppercase">Happy Customers</p>
                </div>
                <div className="w-px bg-emerald-700 h-12"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold">4.8</p>
                  <p className="text-xs text-emerald-300 uppercase">Average Rating</p>
                </div>
              </div>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { name: "Anisul Islam", role: "Food Critic", text: "The best Kachchi I've had in years. The meat explicitly fell off the bone." },
                { name: "Sarah Rahman", role: "Frequent Diner", text: "I love the ambiance. It feels like a high-end restaurant but with the comfort of home." }
              ].map((review, i) => (
                <div key={i} className="bg-emerald-800/50 border border-emerald-700 p-8 rounded-3xl">
                  <div className="flex text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-emerald-100 italic mb-6">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{review.name}</p>
                      <p className="text-xs text-emerald-400">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <UtensilsCrossed size={20} />
              <span className="text-xl font-bold">Bhojone.</span>
            </div>
            <p className="text-sm leading-relaxed">
              Authentic flavors, unforgettable memories. Come dine with us today.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-emerald-400 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-emerald-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-emerald-400 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Menu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Reservation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-emerald-500" />
                <span>123 Banani Road 11,<br />Dhaka 1213, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Coffee size={16} className="text-emerald-500" />
                <span>+880 1711 223344</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-sm mb-4">Subscribe to get offers and updates.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Your email" className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-emerald-500" />
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-900 text-center text-xs">
          <p>&copy; 2026 Bhojone Restaurant. All rights reserved.</p>
        </div>
      </footer>

      {/* --- Modals & Floating Elements --- */}
      <ReservationModal isOpen={isReservationOpen} onClose={closeReservation} />
      <VoiceAgent />
    </div>
  );
}
