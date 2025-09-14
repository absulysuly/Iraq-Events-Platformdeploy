import React, { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react';

// Import types
import type { Language, Event, User, AuthMode, AIAutofillData, Review, City, Category } from './types';

// Import data
import { cities as staticCities, categories as staticCategories } from './data';
import * as api from './services/apiService';
import { useToasts } from './components/ToastProvider';

// Eagerly loaded components
import { Header } from './components/Header';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { SearchBar } from './components/SearchBar';
import { DiscoveryBar } from './components/DiscoveryBar';
import { EventGrid } from './components/EventGrid';
import { EventMap } from './components/EventMap';
import { TopEventsCarousel } from './components/TopEventsCarousel';
import { MagicWandIcon } from './components/icons';
import { SuspenseLoader } from './components/SuspenseLoader';

// Lazy load modals for progressive enhancement
const EventDetailModal = lazy(() => import('./components/EventDetailModal').then(module => ({ default: module.EventDetailModal })));
const CreateEventModal = lazy(() => import('./components/CreateEventModal').then(module => ({ default: module.CreateEventModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(module => ({ default: module.AuthModal })));
const AIAssistantModal = lazy(() => import('./components/AIAssistantModal').then(module => ({ default: module.AIAssistantModal })));
const UserProfileModal = lazy(() => import('./components/UserProfileModal').then(module => ({ default: module.UserProfileModal })));
const AIItineraryModal = lazy(() => import('./components/AIItineraryModal').then(module => ({ default: module.AIItineraryModal })));


const App: React.FC = () => {
    const [lang, setLang] = useState<Language>('en');
    const [events, setEvents] = useState<Event[]>([]);
    const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
    const [cities, setCities] = useState<City[]>(staticCities);
    const [allCategories, setAllCategories] = useState<Category[]>(staticCategories);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [bookmarkedEventIds, setBookmarkedEventIds] = useState<Set<string>>(new Set());
    
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToasts();

    const [filters, setFilters] = useState({
        query: '',
        month: '',
        category: null as string | null,
        city: null as string | null,
    });

    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [isAIAssistantOpen, setAIAssistantOpen] = useState(false);
    const [aiAutofillData, setAiAutofillData] = useState<AIAutofillData | null>(null);
    const [viewedUser, setViewedUser] = useState<User | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'map' | 'bookmarks' | 'my-events'>('grid');
    const [isAIItineraryOpen, setAIItineraryOpen] = useState(false);

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' || lang === 'ku' ? 'rtl' : 'ltr';

        const L = (window as any).L;
        if (L) {
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
        }
    }, [lang]);

    const initializeApp = useCallback(async () => {
        try {
            setIsLoading(true);
            const [eventsData, featuredData] = await Promise.all([
                api.fetchEvents(),
                api.fetchFeaturedEvents(),
            ]);
            setEvents(eventsData);
            setFeaturedEvents(featuredData);
        } catch (error) {
            console.error("Initialization failed:", error);
            addToast("Failed to load event data. Please refresh the page.", 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);
    
    useEffect(() => {
        // Handle auth state changes from Supabase
        const { authListener } = api.onAuthStateChange((_event, session) => {
            const user = session?.user ? {
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email,
                avatarUrl: session.user.user_metadata?.avatar_url || `https://picsum.photos/seed/${session.user.id}/100`,
            } : null;
            setCurrentUser(user);

            // Fetch bookmarks if user is logged in
            if (user) {
                api.getBookmarkedEventIds().then(ids => setBookmarkedEventIds(new Set(ids)));
            } else {
                setBookmarkedEventIds(new Set());
            }
        });
        
        initializeApp();

        return () => {
            // Cleanup the listener
            // FIX: The unsubscribe function is on the subscription property.
            authListener?.subscription?.unsubscribe();
        };

    }, [initializeApp]);


    const categories = useMemo(() => allCategories.filter(c => c.id !== 'all'), [allCategories]);

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const queryLower = filters.query.toLowerCase();
            const title = event.title[lang] || event.title.en;
            const description = event.description[lang] || event.description.en;

            const matchesQuery = queryLower === '' || 
                                 title.toLowerCase().includes(queryLower) || 
                                 description.toLowerCase().includes(queryLower);
            
            const matchesMonth = filters.month === '' || new Date(event.date).getMonth() === parseInt(filters.month, 10);
            
            const matchesCategory = !filters.category || event.categoryId === filters.category;
            
            const matchesCity = !filters.city || event.cityId === filters.city;

            return matchesQuery && matchesMonth && matchesCategory && matchesCity;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events, filters, lang]);

    const bookmarkedEvents = useMemo(() => {
        return filteredEvents.filter(event => bookmarkedEventIds.has(event.id));
    }, [filteredEvents, bookmarkedEventIds]);

    const myEvents = useMemo(() => {
        if (!currentUser) return [];
        return filteredEvents.filter(event => event.organizerId === currentUser.id);
    }, [filteredEvents, currentUser]);

    const handleFilterChange = (type: string, value: string) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    const handleDiscoveryFilterChange = (type: 'city' | 'category', id: string) => {
        if (filters[type] === id) {
            setFilters(prev => ({ ...prev, [type]: null }));
        } else {
            setFilters(prev => ({ ...prev, [type]: id }));
        }
    };
    
    const handleSelectEvent = (event: Event) => setSelectedEvent(event);
    const handleCloseDetailModal = () => setSelectedEvent(null);

    const handleOpenCreateModal = (event?: Event) => {
        if (!currentUser) {
            handleAuthClick('login');
            return;
        }
        setEventToEdit(event || null);
        setCreateModalOpen(true);
    };
    
    const handleOpenAIAssistant = () => {
        if (!currentUser) {
            handleAuthClick('login');
            return;
        }
        setAIAssistantOpen(true);
    };

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
        setEventToEdit(null);
        setAiAutofillData(null);
    };

    const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'reviews' | 'organizerId' | 'bookmarkedBy'>) => {
        if (!currentUser) return;

        try {
            if (eventToEdit) {
                const updatedEvent = await api.updateEvent(eventToEdit.id, eventData);
                setEvents(events.map(e => e.id === eventToEdit.id ? updatedEvent : e));
                addToast('Event updated successfully!', 'success');
            } else {
                const newEvent = await api.createEvent(eventData);
                setEvents([newEvent, ...events]);
                addToast('Event created successfully!', 'success');
            }
            handleCloseCreateModal();
        } catch (error) {
            console.error("Failed to save event:", error);
            addToast('Failed to save event. Please try again.', 'error');
        }
    };

    const handleAuthClick = (mode: AuthMode) => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    const handleLogin = async (credentials: any) => {
        try {
            const { user } = await api.login(credentials);
            setAuthModalOpen(false);
            addToast(`Welcome back, ${user.name}!`, 'success');
        } catch (error) {
            console.error("Login failed:", error);
            const errorMessage = (error as Error).message || 'Login failed. Please check your credentials.';
            addToast(errorMessage, 'error');
            throw error;
        }
    };
    
    const handleSignUp = async (credentials: any) => {
        try {
            const { user } = await api.signUp(credentials);
            setAuthModalOpen(false);
            addToast(`Welcome, ${user.name}! Please check your email to verify your account.`, 'success');
        } catch (error) {
            console.error("Sign up failed:", error);
            const errorMessage = (error as Error).message || 'Sign up failed. Please try again.';
            addToast(errorMessage, 'error');
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            if (viewMode === 'bookmarks' || viewMode === 'my-events') {
                setViewMode('grid');
            }
            addToast("You have been logged out.", 'info');
        } catch (error) {
             addToast("Failed to log out.", 'error');
        }
    };
    
    const handleAddReview = async (eventId: string, reviewData: Omit<Review, 'id' | 'user' | 'timestamp'>) => {
        if (!currentUser) return;
        try {
            const newReview = await api.addReview(eventId, reviewData);
            
            const updateEventState = (prevEvent: Event) => ({
                ...prevEvent,
                reviews: [newReview, ...prevEvent.reviews]
            });

            setEvents(events.map(event => event.id === eventId ? updateEventState(event) : event));
            
            if(selectedEvent?.id === eventId) {
                setSelectedEvent(prev => prev ? updateEventState(prev) : null);
            }
            addToast('Review submitted successfully!', 'success');
        } catch (error) {
            console.error("Failed to add review:", error);
            addToast('Failed to submit review. Please try again.', 'error');
        }
    };
    
    const handleApplyAIData = (data: AIAutofillData) => {
        setAiAutofillData(data);
        setAIAssistantOpen(false);
        setCreateModalOpen(true);
    };

    const handleViewProfile = async (userId: string) => {
        try {
            const user = await api.fetchUser(userId);
            if (user) {
                setViewedUser(user);
            }
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            addToast('Could not load user profile.', 'error');
        }
    };
    
    const handleSelectEventAndClosePlanner = (event: Event) => {
        setAIItineraryOpen(false);
        setSelectedEvent(event);
    };

    const handleToggleBookmark = async (eventId: string) => {
        if (!currentUser) {
            handleAuthClick('login');
            return;
        }
        
        const isCurrentlyBookmarked = bookmarkedEventIds.has(eventId);

        // Optimistic UI update
        const newSet = new Set(bookmarkedEventIds);
        if (isCurrentlyBookmarked) {
            newSet.delete(eventId);
        } else {
            newSet.add(eventId);
        }
        setBookmarkedEventIds(newSet);

        try {
            await api.toggleBookmark(eventId);
            addToast(isCurrentlyBookmarked ? 'Bookmark removed.' : 'Event bookmarked!', 'success');
        } catch (error) {
            console.error("Failed to toggle bookmark:", error);
            addToast('Failed to update bookmark. Please try again.', 'error');
            // Revert UI on failure
            setBookmarkedEventIds(prev => {
                const revertedSet = new Set(prev);
                if (revertedSet.has(eventId)) {
                    revertedSet.delete(eventId);
                } else {
                    revertedSet.add(eventId);
                }
                return revertedSet;
            });
        }
    };

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
            <Header
                lang={lang}
                onLangChange={setLang}
                onOpenCreateModal={() => handleOpenCreateModal()}
                onOpenAIAssistant={handleOpenAIAssistant}
                currentUser={currentUser}
                onAuthClick={handleAuthClick}
                onLogout={handleLogout}
            />

            <main>
                <FeaturedCarousel events={featuredEvents} lang={lang} onSelectEvent={handleSelectEvent} bookmarkedEventIds={bookmarkedEventIds} onToggleBookmark={handleToggleBookmark} />
                <DiscoveryBar
                    cities={cities}
                    categories={allCategories}
                    lang={lang}
                    onFilterChange={handleDiscoveryFilterChange}
                    activeFilters={{ city: filters.city, category: filters.category }}
                />
                <SearchBar
                    cities={cities}
                    categories={allCategories}
                    lang={lang}
                    onFilterChange={handleFilterChange}
                    currentFilters={filters}
                />
                
                <div className="container mx-auto px-4 py-4 text-center">
                    <div className="flex justify-center items-center gap-2" role="group">
                        <div className="inline-flex rounded-md shadow-sm">
                            <button type="button" onClick={() => setViewMode('grid')} className={`px-4 py-2 text-sm font-medium ${viewMode === 'grid' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'} border border-gray-600 rounded-l-lg hover:bg-gray-600 focus:outline-none`}>
                                Grid
                            </button>
                            <button type="button" onClick={() => setViewMode('map')} className={`px-4 py-2 text-sm font-medium ${viewMode === 'map' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'} border-y border-gray-600 hover:bg-gray-600 focus:outline-none`}>
                                Map
                            </button>
                             {currentUser && (
                                <button type="button" onClick={() => setViewMode('my-events')} className={`px-4 py-2 text-sm font-medium ${viewMode === 'my-events' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'} border-y border-r border-gray-600 hover:bg-gray-600 focus:outline-none`}>
                                    My Events
                                </button>
                            )}
                            <button type="button" onClick={() => setViewMode('bookmarks')} className={`px-4 py-2 text-sm font-medium ${viewMode === 'bookmarks' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'} border ${currentUser ? 'border-l-0' : ''} border-gray-600 rounded-r-lg hover:bg-gray-600 focus:outline-none`}>
                                Bookmarks
                            </button>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setAIItineraryOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white border border-indigo-500 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
                        >
                            <MagicWandIcon className="w-4 h-4" />
                            AI Planner
                        </button>
                    </div>
                </div>

                {isLoading ? <SuspenseLoader /> : (
                  <>
                    {viewMode === 'grid' && (
                        <EventGrid events={filteredEvents} lang={lang} onSelectEvent={handleSelectEvent} bookmarkedEventIds={bookmarkedEventIds} onToggleBookmark={handleToggleBookmark} viewType="all" />
                    )}
                     {viewMode === 'map' && (
                        <EventMap events={filteredEvents} lang={lang} onSelectEvent={handleSelectEvent} />
                    )}
                     {viewMode === 'bookmarks' && (
                        <EventGrid events={bookmarkedEvents} lang={lang} onSelectEvent={handleSelectEvent} bookmarkedEventIds={bookmarkedEventIds} onToggleBookmark={handleToggleBookmark} viewType="bookmarks" />
                    )}
                    {viewMode === 'my-events' && (
                        <EventGrid events={myEvents} lang={lang} onSelectEvent={handleSelectEvent} bookmarkedEventIds={bookmarkedEventIds} onToggleBookmark={handleToggleBookmark} viewType="my-events" />
                    )}
                  </>
                )}
                
                <TopEventsCarousel events={featuredEvents.slice(0, 5)} lang={lang} onSelectEvent={handleSelectEvent} bookmarkedEventIds={bookmarkedEventIds} onToggleBookmark={handleToggleBookmark} />
            </main>

            {/* Modals */}
            <Suspense fallback={<SuspenseLoader />}>
                {selectedEvent && (
                    <EventDetailModal
                        event={selectedEvent}
                        onClose={handleCloseDetailModal}
                        lang={lang}
                        onAddReview={handleAddReview}
                        currentUser={currentUser}
                        onEdit={handleOpenCreateModal}
                        onViewProfile={handleViewProfile}
                        isBookmarked={bookmarkedEventIds.has(selectedEvent.id)}
                        onToggleBookmark={handleToggleBookmark}
                    />
                )}
                {isCreateModalOpen && (
                    <CreateEventModal
                        isOpen={isCreateModalOpen}
                        onClose={handleCloseCreateModal}
                        onSave={handleSaveEvent}
                        cities={cities}
                        categories={categories}
                        lang={lang}
                        eventToEdit={eventToEdit}
                        aiAutofillData={aiAutofillData}
                        currentUser={currentUser}
                    />
                )}
                {isAuthModalOpen && (
                    <AuthModal
                        isOpen={isAuthModalOpen}
                        onClose={() => setAuthModalOpen(false)}
                        initialMode={authMode}
                        onLogin={handleLogin}
                        onSignUp={handleSignUp}
                        onForgotPassword={async (email) => { 
                            try {
                                await api.resetPassword(email);
                                addToast('Password reset link sent!', 'info');
                                return true;
                            } catch (error) {
                                addToast((error as Error).message, 'error');
                                return false;
                            }
                        }}
                        lang={lang}
                    />
                )}
                {isAIAssistantOpen && (
                    <AIAssistantModal
                        isOpen={isAIAssistantOpen}
                        onClose={() => setAIAssistantOpen(false)}
                        onApply={handleApplyAIData}
                        cities={cities}
                        categories={categories}
                    />
                )}
                {isAIItineraryOpen && (
                    <AIItineraryModal
                        isOpen={isAIItineraryOpen}
                        onClose={() => setAIItineraryOpen(false)}
                        events={events}
                        lang={lang}
                        onSelectEvent={handleSelectEventAndClosePlanner}
                    />
                )}
                {viewedUser && (
                    <UserProfileModal
                        user={viewedUser}
                        onClose={() => setViewedUser(null)}
                    />
                )}
            </Suspense>
        </div>
    );
};

export default App;
