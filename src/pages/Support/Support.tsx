import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { Tickets, User } from '../../types';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Loader from '../../common/Loader';
import {
  fetchTicketsAsync,
  selectAllTickets,
  selectTicketsLoading,
  selectTicketMessageLoading,
  fetchMessagesAsync,
  selectTicketMessages,
  replyMessageAsync,
  updateTicketStatusAsync,
  increaseUnreadCount,
  resetUnreadMessages,
  resetAdminUnreadMessages,
  addMessage,
  markAllMessagesAsRead,
  addTicket,
} from '../../features/support/supportSlice';
import { API_URL } from '../../api/routes';

const socket = io(API_URL);
interface Message {
  sender: 'user' | 'admin';
  text: string;
  isRead: boolean;
}

const Support: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);
  const adminId = user?._id;
  const tickets = useSelector(selectAllTickets);
  const isTicketsLoading = useSelector(selectTicketsLoading);
  const isTicketMessageLoading = useSelector(selectTicketMessageLoading);
  const messages = useSelector(selectTicketMessages);
  const [selectedTicket, setSelectedTicket] = useState<Tickets | null>(null);
  const [input, setInput] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [filters, setFilters] = useState({ status: 'open', search: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = useCallback(async () => {
    console.log('fetch tickets');
    try {
      await dispatch(fetchTicketsAsync()).unwrap();
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    }
  }, []);

  const fetchMessages = async (ticket: Tickets) => {
    console.log('....fetched messages');
    try {
      setSelectedTicket(ticket);
      const ticketId = ticket._id;
      const query = {
        role: 'admin',
      };
      await dispatch(fetchMessagesAsync({ ticketId, query }));
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast.error(error || 'Error fetching messages');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedTicket) return;

    try {
      await dispatch(
        replyMessageAsync({ ticketId: selectedTicket._id, text: input }),
      );

      socket.emit('adminSendMessage', {
        ticketId: selectedTicket._id,
        text: input,
      });
      // setMessages((prev) => [...prev, { sender: 'admin', text: input }]);
      setInput('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error || 'Failed to send message');
    }
  };

  // const handleFilterChanges = (e: ChangeEvent<HTMLSelectElement>) => {
  //   const value = e.target.value;
  //   setStatusFilter(value);
  //   if (value === 'completed' || value === 'closed') {
  //     setSelectedTicket(null);
  //   }
  //   fetchTickets();
  // };
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Update Ticket Status
  const updateTicketStatus = async (
    ticketId: string,
    newStatus: 'open' | 'completed' | 'closed',
  ) => {
    try {
      const formData = {
        status: newStatus,
      };
      await dispatch(updateTicketStatusAsync({ ticketId, formData }));
      fetchTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket');
    }
  };

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchTickets();
  }, []);
  // Setup Socket Listeners
  useEffect(() => {
    console.log('useEeffetc called');
    // fetchTickets();
    socket.emit('register', 'admin-room');

    const handleNewMessage = (data: any) => {
      console.log('New Message Arrived from user:', data);
      if (selectedTicket && selectedTicket._id === data.ticketId) {
        dispatch(
          addMessage({
            sender: data.sender,
            text: data.text,
            isRead: data.isRead,
          }),
        );

        if (data.sender === 'admin') {
          console.log('Seen request sent by admin');
          socket.emit('seenRequest', {
            ticketId: data.ticketId,
            sender: data.sender,
            userId: selectedTicket.userId?._id.toString(),
          });
        }
      } else {
        dispatch(increaseUnreadCount({ ticketId: data.ticketId }));
      }
    };

    const handleMessagesRead = ({ ticketId }: { ticketId: string }) => {
      if (!ticketId) return;
      if (selectedTicket?._id === ticketId) {
        dispatch(markAllMessagesAsRead());
      }
      dispatch(resetUnreadMessages({ ticketId }));
    };

    const handleNewTicketCreated = (newTicket: any) => {
      dispatch(addTicket(newTicket));
      toast.success(`New ticket created: ${newTicket.subject}`);
    };

    const handleSeenRequest = ({ ticketId }: { ticketId: string }) => {
      console.log('Seen request received by admin for ticket:', ticketId);
      if (selectedTicket?._id === ticketId) {
        dispatch(markAllMessagesAsRead());
        socket.emit('seen', {
          ticketId,
          sender: 'admin',
          userId: selectedTicket?.userId?._id.toString(),
        });
        console.log('Seen triggered by admin');
      }
      dispatch(resetAdminUnreadMessages({ ticketId }));
    };

    const handleSeen = ({ ticketId }: { ticketId: string }) => {
      if (selectedTicket?._id === ticketId) {
        dispatch(markAllMessagesAsRead());
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('newTicketCreated', handleNewTicketCreated);
    socket.on('seenRequest', handleSeenRequest);
    socket.on('seen', handleSeen);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('newTicketCreated', handleNewTicketCreated);
      socket.off('seenRequest', handleSeenRequest);
      socket.off('seen', handleSeen);
      socket.off('register');
    };
  }, [dispatch, socket, selectedTicket]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      ticket.status.toLowerCase() === filters.status.toLowerCase();

    const matchesSearch =
      filters.search.trim() === '' ||
      ticket._id.includes(filters.search) ||
      ticket.userId?.username
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // console.log('messages', messages);
  // console.log('selectedTicket', selectedTicket);
  // console.log('filters', filters);
  // console.log('tickets', tickets);
  return (
    <>
      <Breadcrumb pageName="Admin Ticket Panel" />
      <div className="p-4">
        {/* Ticket Filter */}
        <div className="bg-white dark:bg-boxdark shadow-md rounded-lg p-4 mb-4 border border-gray-300 dark:border-gray-700">
          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Filter Tickets:
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 p-3 focus:ring focus:ring-primary outline-none transition"
          >
            <option value="open">Open</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Ticket Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Ticket ID or Username"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 p-3 focus:ring focus:ring-primary outline-none transition"
          />
        </div>

        {isTicketsLoading ? (
          <div className="flex items-center justify-center">
            <Loader loader="ClipLoader" size={50} color="blue" />
          </div>
        ) : (
          <>
            {/* Ticket Table */}
            <div className="rounded-lg border mt-6 border-gray-300 bg-white shadow-lg dark:bg-boxdark dark:border-gray-700">
              {/* Ticket Count */}
              <div className="p-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">
                | All Tickets: ({filteredTickets.length})
              </div>

              {/* Table */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                  {/* Table Header */}
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="py-3 px-4 font-semibold uppercase">
                        Ticket ID
                      </th>
                      <th className="py-3 px-4 font-semibold uppercase">
                        Status
                      </th>
                      <th className="py-3 px-4 font-semibold uppercase">
                        Change Status
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}

                  <tbody className=" divide-y divide-gray-200 dark:divide-gray-700 text-center">
                    {filteredTickets.length > 0 ? (
                      filteredTickets.map((ticket: Tickets) => (
                        <React.Fragment key={ticket._id}>
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            {/* Ticket ID - Centered */}
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => fetchMessages(ticket)}
                                className="relative bg-blue-500 text-white rounded-lg px-4 py-2 shadow-md hover:bg-blue-600 dark:hover:bg-blue-400 transition"
                              >
                                #{ticket._id}{' '}
                                {ticket.userId?.username &&
                                  `(${ticket.userId.username})`}
                                {ticket.unreadMessages?.admin > 0 && (
                                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full transform translate-x-1/2 -translate-y-1/2 shadow-md">
                                    {ticket.unreadMessages.admin}
                                  </span>
                                )}
                              </button>
                            </td>

                            {/* Status - Centered */}
                            <td className="py-4 px-4 text-center">
                              <div
                                className={`py-2 px-4 font-medium rounded-full text-center 
                                ${
                                  ticket.status === 'open'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                                    : ''
                                } 
                                ${
                                  ticket.status === 'completed'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                                    : ''
                                } 
                                ${
                                  ticket.status === 'closed'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                                    : ''
                                }`}
                              >
                                {ticket.status.charAt(0).toUpperCase() +
                                  ticket.status.slice(1)}
                              </div>
                            </td>

                            {/* Change Status - Centered */}
                            <td className="py-4 px-4 text-center">
                              <select
                                value={ticket.status}
                                onChange={(e) =>
                                  updateTicketStatus(
                                    ticket._id,
                                    e.target.value as
                                      | 'open'
                                      | 'completed'
                                      | 'closed',
                                  )
                                }
                                className="border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-300 bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                              >
                                <option value="open">Open</option>
                                <option value="completed">Completed</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>
                          </tr>

                          {/* Chat Row (Only Visible When Ticket is Selected) */}
                          {selectedTicket?._id === ticket._id && (
                            <tr>
                              <td
                                colSpan={3}
                                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-b-lg"
                              >
                                <div className="rounded-lg shadow-md bg-white dark:bg-gray-900 p-4">
                                  <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Chat in Ticket #{selectedTicket._id}{' '}
                                    {selectedTicket.userId?.username &&
                                      `(${selectedTicket.userId.username})`}
                                  </h3>
                                  <div className="max-h-64 overflow-y-auto border p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    {isTicketMessageLoading ? (
                                      <div className="flex items-center justify-center">
                                        <Loader
                                          loader="ClipLoader"
                                          size={40}
                                          color="blue"
                                        />
                                      </div>
                                    ) : (
                                      <>
                                        {messages.length === 0 ? (
                                          <p className="text-center text-gray-600 dark:text-gray-300">
                                            No messages yet.
                                          </p>
                                        ) : (
                                          <>
                                            {messages.map((msg, index) => (
                                              <p
                                                key={index}
                                                className={`py-1 mb-2 ${
                                                  msg.sender === 'admin'
                                                    ? 'text-right text-blue-700 dark:text-blue-300'
                                                    : 'text-left text-gray-700 dark:text-gray-300'
                                                }`}
                                              >
                                                <span className="bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-lg shadow">
                                                  {msg.text}
                                                </span>
                                                <span
                                                  className={`text-[10px]  font-semibold ${
                                                    msg.isRead
                                                      ? 'text-green-700 dark:text-green-300'
                                                      : 'text-gray-500 dark:text-gray-400'
                                                  }`}
                                                >
                                                  {msg.isRead ? '✔✔' : '✔'}
                                                </span>
                                              </p>
                                            ))}
                                          </>
                                        )}
                                      </>
                                    )}

                                    <div ref={messagesEndRef} />
                                  </div>
                                  <div className="mt-3 flex">
                                    <input
                                      type="text"
                                      value={input}
                                      onChange={(e) => setInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          sendMessage();
                                        }
                                      }}
                                      className="flex-1 border p-2 rounded-l-lg shadow-sm focus:ring focus:ring-green-300 bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                    />
                                    <div>
                                      <button
                                        onClick={sendMessage}
                                        className="bg-green-500 px-4 py-2 rounded-r-lg text-white shadow-md hover:bg-green-600 dark:hover:bg-green-400 transition"
                                      >
                                        Send
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-5 text-gray-500 dark:text-gray-400"
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Support;
