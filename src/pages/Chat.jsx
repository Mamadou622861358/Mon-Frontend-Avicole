import {
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { chatService } from "../../services/api";

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const contextFarm = location.state?.contextFarm;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Récupérer ou créer une conversation
        const conversationsResponse = await chatService.getConversations();
        console.log("Réponse des conversations:", conversationsResponse);

        // Extraire les conversations de la réponse
        let conversations;
        if (
          conversationsResponse?.data?.success &&
          conversationsResponse?.data?.data
        ) {
          // Format: { success: true, data: [...] }
          conversations = Array.isArray(conversationsResponse.data.data)
            ? conversationsResponse.data.data
            : [];
        } else if (Array.isArray(conversationsResponse?.data)) {
          // Format: [...] directement
          conversations = conversationsResponse.data;
        } else if (Array.isArray(conversationsResponse?.data?.conversations)) {
          // Format: { conversations: [...] }
          conversations = conversationsResponse.data.conversations;
        } else {
          conversations = [];
        }

        console.log("Conversations normalisées:", conversations);
        let activeConversation = Array.isArray(conversations)
          ? conversations.find((conv) => conv.status === "active")
          : null;

        if (!activeConversation) {
          // Créer une nouvelle conversation
          const newConversationResponse = await chatService.createConversation({
            type: "support",
            title: contextFarm
              ? `Contact ferme: ${contextFarm.name}`
              : "Support client",
            participants: [
              {
                user: user.id,
                role: user.role || "user",
              },
            ],
            metadata: contextFarm
              ? { farmId: contextFarm.id, farmName: contextFarm.name }
              : undefined,
          });
          console.log(
            "Réponse de création de conversation:",
            newConversationResponse
          );
          activeConversation =
            newConversationResponse?.data?.data ||
            newConversationResponse?.data;
        }

        if (!activeConversation?._id) {
          console.error("ID de conversation manquant:", activeConversation);
          throw new Error("ID de conversation manquant");
        }

        setConversationId(activeConversation._id);

        // Charger les messages de la conversation
        try {
          const messagesResponse = await chatService.getMessages(
            activeConversation._id
          );
          console.log("Réponse des messages:", messagesResponse);
          const messages = Array.isArray(messagesResponse?.data)
            ? messagesResponse.data
            : Array.isArray(messagesResponse?.data?.messages)
            ? messagesResponse.data.messages
            : [];
          console.log("Messages normalisés:", messages);
          setMessages(messages);

          // Pré-remplir un message de premier contact si une ferme a été passée en contexte
          if (contextFarm) {
            setNewMessage((prev) =>
              prev && prev.trim().length > 0
                ? prev
                : `Bonjour, je souhaite entrer en contact avec la ferme "${contextFarm.name}".`
            );
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des messages:", error);
          setMessages([]);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation du chat:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeChat();
    } else {
      setLoading(false);
    }
  }, [user, contextFarm]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      const messageData = {
        content: newMessage,
        type: "text",
      };

      const response = await chatService.sendMessage(
        conversationId,
        messageData
      );
      const sentMessage = response.data;

      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-gray-600">Chargement du chat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-sm">
        {/* En-tête du chat */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">GA</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Support GuinéeAvicole
                </h2>
                <p className="text-sm text-green-600">En ligne</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Zone des messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Aucun message pour le moment.</p>
              <p className="text-sm mt-2">
                Commencez une conversation avec notre équipe de support !
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id || message.id}
                className={`flex ${
                  message.sender?._id === user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender?._id === user?.id
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender?._id === user?.id
                        ? "text-green-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(new Date(message.createdAt))}
                  </p>
                </div>
              </div>
            ))
          )}

          {/* Indicateur de frappe */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="border-t border-gray-200 p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Informations utiles */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Notre équipe de support est disponible du lundi au vendredi de 8h
              à 18h
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border">
                Réponse rapide
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border">
                Support technique
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border">
                Conseils d'élevage
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
