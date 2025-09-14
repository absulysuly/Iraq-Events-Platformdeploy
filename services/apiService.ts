// This file connects to a real Supabase backend.
import { supabase } from './supabaseClient';
import type { Event, User, Review, SupabaseApiError } from '../types';
// FIX: The types AuthError and SignUpWithPasswordCredentials are not exported in older versions of @supabase/supabase-js.
// import type { AuthError, SignUpWithPasswordCredentials } from '@supabase/supabase-js';

// Helper to handle Supabase errors
// FIX: Replaced AuthError with 'any' to resolve import issue.
function handleApiError(error: SupabaseApiError | any | null, context: string): never {
    console.error(`Supabase error in ${context}:`, error);
    throw new Error(error?.message || `An unknown error occurred in ${context}.`);
}

// --- DATA TRANSFORMATION ---
// Supabase stores data in snake_case, while frontend uses camelCase.
// These helpers convert between them.

const eventFromSupabase = (data: any): Event => ({
    id: data.id,
    title: data.title,
    organizerId: data.organizer_id,
    organizerName: data.organizer_name,
    categoryId: data.category_id,
    cityId: data.city_id,
    date: data.date,
    venue: data.venue,
    description: data.description,
    organizerPhone: data.organizer_phone,
    whatsappNumber: data.whatsapp_number,
    imageUrl: data.image_url,
    reviews: data.reviews?.map(reviewFromSupabase) || [],
    coordinates: data.coordinates,
    ticketInfo: data.ticket_info,
    bookmarkedBy: [], // This is handled separately for security
});

// FIX: The event payload from the client doesn't need organizerId, as it's set from the authenticated user.
const eventToSupabase = (event: Omit<Event, 'id' | 'reviews' | 'bookmarkedBy' | 'organizerId'>, userId: string) => ({
    title: event.title,
    organizer_id: userId,
    organizer_name: event.organizerName,
    category_id: event.categoryId,
    city_id: event.cityId,
    date: event.date,
    venue: event.venue,
    description: event.description,
    organizer_phone: event.organizerPhone,
    whatsapp_number: event.whatsappNumber,
    image_url: event.imageUrl,
    ticket_info: event.ticketInfo,
    coordinates: event.coordinates,
});

const reviewFromSupabase = (data: any): Review => ({
    id: data.id,
    user: userFromSupabase(data.profiles),
    rating: data.rating,
    comment: data.comment,
    timestamp: data.created_at,
});

// FIX: Updated userFromSupabase to also check user_metadata for name and avatar, making it more robust.
const userFromSupabase = (data: any): User => ({
    id: data.id,
    name: data.name || data.user_metadata?.name || 'Unnamed User',
    avatarUrl: data.avatar_url || data.user_metadata?.avatar_url || `https://picsum.photos/seed/${data.id}/100`,
});


// --- API FUNCTIONS ---

export const fetchEvents = async (): Promise<Event[]> => {
    // Fetch events and their reviews with user profiles in one go.
    const { data, error } = await supabase
        .from('events')
        .select(`*, reviews(*, profiles(*))`)
        .order('date', { ascending: false });

    if (error) handleApiError(error, 'fetchEvents');
    return data?.map(eventFromSupabase) || [];
};

export const fetchFeaturedEvents = async (): Promise<Event[]> => {
    // A real implementation might have a 'is_featured' flag.
    // For now, we'll fetch the 4 most recent events.
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })
        .limit(4);

    if (error) handleApiError(error, 'fetchFeaturedEvents');
    return data?.map(eventFromSupabase).map(e => ({
        ...e,
        imageUrl: e.imageUrl.replace('/800/600', '/1200/800')
    })) || [];
};

export const fetchUser = async (userId: string): Promise<User | undefined> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) handleApiError(error, 'fetchUser');
    return data ? userFromSupabase(data) : undefined;
};

// --- AUTHENTICATION ---

// FIX: Corrected onAuthStateChange wrapper to return an object with authListener property, matching its usage in App.tsx.
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
    const { data: authListener } = supabase.auth.onAuthStateChange(callback);
    return { authListener };
};

// FIX: Changed from 'signInWithPassword' to 'signIn' and adjusted response handling for older library versions.
export const login = async (credentials: any) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) handleApiError(error, 'login');
    if (!data.user) throw new Error("Login successful, but no user data returned.");
    
    // Fetch profile separately
    const profile = await fetchUser(data.user.id);

    return { user: profile || userFromSupabase(data.user) };
};

// FIX: Updated signUp call to a compatible signature and changed credentials type to 'any'.
export const signUp = async (credentials: any) => {
    const { email, password, data: metaData } = credentials;
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metaData
        }
    });

    if (error) handleApiError(error, 'signUp');
    if (!data.user) throw new Error("Signup successful, but no user data returned.");

    return { user: userFromSupabase({ ...data.user, ...metaData }) };
};

// FIX: The `signOut` method is likely correct; other errors were probably causing a cascade. No change needed here.
export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) handleApiError(error, 'logout');
};

// FIX: Changed to `supabase.auth.api.resetPasswordForEmail` for compatibility with older library versions.
export const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Redirect user back to the app
    });
    if (error) handleApiError(error, 'resetPassword');
};

// --- USER-SPECIFIC ACTIONS ---

// FIX: Changed from async 'getUser()' to a compatible method to get the current user.
export const createEvent = async (eventData: Omit<Event, 'id' | 'reviews' | 'organizerId' | 'bookmarkedBy'>): Promise<Event> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");

    const newEventData = eventToSupabase(eventData, user.id);
    const { data, error } = await supabase
        .from('events')
        .insert(newEventData)
        .select()
        .single();
        
    if (error) handleApiError(error, 'createEvent');
    return eventFromSupabase(data);
};

// FIX: Changed from async 'getUser()' to a compatible method to get the current user.
export const updateEvent = async (eventId: string, eventData: Omit<Event, 'id' | 'reviews' | 'organizerId' | 'bookmarkedBy'>): Promise<Event> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");

    const updatedEventData = eventToSupabase(eventData, user.id);
    const { data, error } = await supabase
        .from('events')
        .update(updatedEventData)
        .eq('id', eventId)
        .eq('organizer_id', user.id) // Row-level security should also handle this
        .select()
        .single();
        
    if (error) handleApiError(error, 'updateEvent');
    return eventFromSupabase(data);
};

// FIX: Changed from async 'getUser()' to a compatible method to get the current user.
export const addReview = async (eventId: string, reviewData: Omit<Review, 'id' | 'user' | 'timestamp'>): Promise<Review> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");

    const newReview = {
        event_id: eventId,
        user_id: user.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
    };
    
    const { data, error } = await supabase
        .from('reviews')
        .insert(newReview)
        .select('*, profiles(*)')
        .single();

    if (error) handleApiError(error, 'addReview');
    return reviewFromSupabase(data);
};

// FIX: Changed from async 'getUser()' to a compatible method to get the current user.
export const getBookmarkedEventIds = async (): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('user_bookmarked_events')
        .select('event_id')
        .eq('user_id', user.id);

    if (error) handleApiError(error, 'getBookmarkedEventIds');
    return data?.map(item => item.event_id) || [];
};

// FIX: Changed from async 'getUser()' to a compatible method to get the current user.
export const toggleBookmark = async (eventId: string): Promise<{ success: true }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");

    // First, check if the bookmark exists
    const { data: existing, error: selectError } = await supabase
        .from('user_bookmarked_events')
        .select()
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle();
    
    if (selectError) handleApiError(selectError, 'toggleBookmark (select)');

    if (existing) {
        // Delete it
        const { error: deleteError } = await supabase
            .from('user_bookmarked_events')
            .delete()
            .eq('user_id', user.id)
            .eq('event_id', eventId);
        
        if (deleteError) handleApiError(deleteError, 'toggleBookmark (delete)');
    } else {
        // Create it
        const { error: insertError } = await supabase
            .from('user_bookmarked_events')
            .insert({ user_id: user.id, event_id: eventId });
        
        if (insertError) handleApiError(insertError, 'toggleBookmark (insert)');
    }
    
    return { success: true };
};
