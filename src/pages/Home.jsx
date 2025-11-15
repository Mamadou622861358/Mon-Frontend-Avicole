/**
 * Page d'accueil - Présentation de la plateforme GuinéeAvicole
 */

import {
  BookOpen,
  Briefcase,
  ChevronRight,
  HeadphonesIcon,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
        {/* Background Slider */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="relative w-full h-full">
              {/* Image Carousel */}
              <div className="relative w-full h-full">
                <div
                  className="absolute inset-0 bg-cover bg-center animate-[slideshow_40s_ease-in-out_infinite_0s]"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1569396327972-6231a5b05ea8?auto=format&fit=crop&w=1920&q=80')",
                  }}
                ></div>
                <div
                  className="absolute inset-0 bg-cover bg-center animate-[slideshow_40s_ease-in-out_infinite_5s]"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1462027076063-1ceabb252dbd?auto=format&fit=crop&w=1920&q=80')",
                  }}
                ></div>
                <div
                  className="absolute inset-0 bg-cover bg-center animate-[slideshow_40s_ease-in-out_infinite_10s]"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=1920&q=80')",
                  }}
                ></div>
                <div
                  className="absolute inset-0 bg-cover bg-center animate-[slideshow_40s_ease-in-out_infinite_15s]"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1588597989061-b60ad0eefdbf?auto=format&fit=crop&w=1920&q=80')",
                  }}
                ></div>
                <div
                  className="absolute inset-0 bg-cover bg-center animate-[slideshow_40s_ease-in-out_infinite_20s]"
                  style={{
                    backgroundImage:
                      "url('https://plus.unsplash.com/premium_photo-1676686126965-cb536e2328c3?auto=format&fit=crop&w=1920&q=80')",
                  }}
                ></div>
                <div
                  className="absolute inset-0 bg-cover bg-center animate-[slideshow_40s_ease-in-out_infinite_25s]"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1578051696754-4652a8f67882?auto=format&fit=crop&w=1920&q=80')",
                  }}
                ></div>
                <div
                  className="absolute inset-0 bg-cover bg-center animate-[slideshow_40s_ease-in-out_infinite_30s]"
                  style={{
                    backgroundImage:
                      "url('https://plus.unsplash.com/premium_photo-1676686125407-227f3d352df8?auto=format&fit=crop&w=1920&q=80')",
                  }}
                ></div>
                <div
                  className="absolute inset-0 bg-cover bg-center animate-[slideshow_40s_ease-in-out_infinite_35s]"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1535275226173-7ee8b465f0c1?auto=format&fit=crop&w=1920&q=80')",
                  }}
                ></div>
              </div>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4">
          <div className="max-w-4xl">
            <h1
              className="animate-fade-in text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight opacity-0"
              style={{ animationDelay: "0.3s" }}
            >
              Bienvenue sur <br />
              <span
                className="text-green-400 inline-block animate-slide-up opacity-0"
                style={{ animationDelay: "0.6s" }}
              >
                GuinéeAvicole
              </span>
            </h1>
            <p
              className="animate-slide-up text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl leading-relaxed opacity-0"
              style={{ animationDelay: "0.9s" }}
            >
              La plateforme de référence pour l'aviculture en Guinée. Connectons
              nos producteurs et les consommateurs pour une collaboration
              durable.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-in opacity-0"
              style={{ animationDelay: "1.2s" }}
            >
              <Link
                to="/products"
                className="group bg-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-600 transition-all transform hover:scale-105 inline-flex items-center justify-center"
              >
                Découvrir nos produits
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="group bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all transform hover:scale-105 inline-flex items-center justify-center"
              >
                Rejoindre la plateforme
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Services
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Formations, assistance technique et conseils pour développer votre
              activité avicole de manière professionnelle et durable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Formation Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img
                  src="https://plus.unsplash.com/premium_photo-1661963268465-6e586f17855c?auto=format&fit=crop&w=800&q=80"
                  alt="Formation en élevage de volailles"
                  className="object-cover w-full h-48 transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
              </div>
              <div className="p-6">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Formation Avicole
                </h3>
                <p className="text-gray-600 mb-4">
                  Formations complètes sur l'élevage moderne de volailles,
                  adaptées à tous les niveaux.
                </p>
                <Link
                  to="/services/formation"
                  className="text-blue-600 font-semibold inline-flex items-center group-hover:text-blue-700"
                >
                  En savoir plus{" "}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Assistance Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1535275226173-7ee8b465f0c1?auto=format&fit=crop&w=800&q=80"
                  alt="Suivi sanitaire des volailles"
                  className="object-cover w-full h-48 transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
              </div>
              <div className="p-6">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <HeadphonesIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Assistance Technique
                </h3>
                <p className="text-gray-600 mb-4">
                  Support vétérinaire et technique personnalisé pour optimiser
                  votre production.
                </p>
                <Link
                  to="/services/assistance"
                  className="text-green-600 font-semibold inline-flex items-center group-hover:text-green-700"
                >
                  En savoir plus{" "}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Conseil Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1590677147861-622ec92a60f6?auto=format&fit=crop&w=800&q=80"
                  alt="Conseil en élevage avicole"
                  className="object-cover w-full h-48 transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
              </div>
              <div className="p-6">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Conseil Business
                </h3>
                <p className="text-gray-600 mb-4">
                  Accompagnement personnalisé pour développer et optimiser votre
                  entreprise avicole.
                </p>
                <Link
                  to="/services/conseil"
                  className="text-purple-600 font-semibold inline-flex items-center group-hover:text-purple-700"
                >
                  En savoir plus{" "}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/services"
              className="inline-flex items-center px-8 py-4 bg-green-500 text-white rounded-full text-lg font-semibold hover:bg-green-600 transform hover:scale-105 transition-all"
            >
              Découvrir tous nos services
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir GuinéeAvicole ?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Nous offrons une expérience unique qui bénéficie à tous les
              acteurs de la chaîne avicole guinéenne.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Qualité Card */}
            <div className="group relative overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1588597989061-b60ad0eefdbf?auto=format&fit=crop&w=800&q=80"
                  alt="Formation en élevage avicole"
                  className="object-cover w-full h-48 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Produits de Qualité
                </h3>
                <p className="text-gray-600">
                  Une large gamme de produits avicoles sélectionnés avec soin
                  pour garantir la meilleure qualité.
                </p>
              </div>
            </div>

            {/* Producteurs Card */}
            <div className="group relative overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1569396327972-6231a5b05ea8?auto=format&fit=crop&w=800&q=80"
                  alt="Assistance technique avicole"
                  className="object-cover w-full h-48 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Producteurs Locaux
                </h3>
                <p className="text-gray-600">
                  Un réseau de producteurs locaux engagés dans une démarche de
                  qualité et de durabilité.
                </p>
              </div>
            </div>

            {/* Traçabilité Card */}
            <div className="group relative overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=800&q=80"
                  alt="Traçabilité des volailles"
                  className="object-cover w-full h-48 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Traçabilité Complète
                </h3>
                <p className="text-gray-600">
                  Suivez le parcours de vos produits de la ferme à votre
                  assiette grâce à notre système de traçabilité.
                </p>
              </div>
            </div>

            {/* Livraison Card */}
            <div className="group relative overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1583510383754-35fc1d1eb598?auto=format&fit=crop&w=800&q=80"
                  alt="Conseil en entreprise avicole"
                  className="object-cover w-full h-48 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Livraison Rapide
                </h3>
                <p className="text-gray-600">
                  Service de livraison professionnel et rapide dans toutes les
                  principales villes de Guinée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/2255459/pexels-photo-2255459.jpeg?auto=compress&cs=tinysrgb&w=1920')",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Prêt à rejoindre la révolution avicole ?
          </h2>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Inscrivez-vous maintenant et bénéficiez de nos services premium pour
            développer votre activité avicole.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-green-500 text-white rounded-full text-lg font-semibold hover:bg-green-600 transform hover:scale-105 transition-all"
          >
            Commencer maintenant
            <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
