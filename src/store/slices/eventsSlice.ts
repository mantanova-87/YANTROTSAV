import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { eventsService } from '../../services/appwrite/events.service'
import type { EventDocument, CreateEventDTO, UpdateEventDTO } from '../../types/database.types'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes cache

interface EventsState {
  events: EventDocument[]
  selectedEvent: EventDocument | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  lastFetched: number | null
}

const initialState: EventsState = {
  events: [],
  selectedEvent: null,
  status: 'idle',
  error: null,
  lastFetched: null,
}

/**
 * Async thunk to fetch events with intelligent client-side caching
 */
export const fetchEventsThunk = createAsyncThunk(
  'events/fetchEvents',
  async (
    options: { force?: boolean; category?: string } | undefined,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { events: EventsState }
      const { lastFetched, events } = state.events

      // Return cached events if fresh and force is not requested
      if (!options?.force && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && events.length > 0) {
        return { events, fromCache: true }
      }

      const freshEvents = await eventsService.getEvents({
        category: options?.category,
      })

      return { events: freshEvents, fromCache: false }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch events from registry.')
    }
  }
)

/**
 * Async thunk to create a new event (Admin)
 */
export const createEventThunk = createAsyncThunk(
  'events/createEvent',
  async (data: CreateEventDTO, { rejectWithValue }) => {
    try {
      const newEvent = await eventsService.createEvent(data)
      return newEvent
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to create event.')
    }
  }
)

/**
 * Async thunk to update an existing event (Admin)
 */
export const updateEventThunk = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, data }: { eventId: string; data: UpdateEventDTO }, { rejectWithValue }) => {
    try {
      const updatedEvent = await eventsService.updateEvent(eventId, data)
      return updatedEvent
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to update event.')
    }
  }
)

/**
 * Async thunk to delete an event (Admin)
 */
export const deleteEventThunk = createAsyncThunk(
  'events/deleteEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      await eventsService.deleteEvent(eventId)
      return eventId
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete event.')
    }
  }
)

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSelectedEvent: (state, action: PayloadAction<EventDocument | null>) => {
      state.selectedEvent = action.payload
    },
    invalidateEventsCache: (state) => {
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Events
    builder
      .addCase(fetchEventsThunk.pending, (state) => {
        if (state.events.length === 0) {
          state.status = 'loading'
        }
        state.error = null
      })
      .addCase(fetchEventsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.events = action.payload.events
        if (!action.payload.fromCache) {
          state.lastFetched = Date.now()
        }
      })
      .addCase(fetchEventsThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

    // Create Event
    builder.addCase(createEventThunk.fulfilled, (state, action) => {
      state.events.unshift(action.payload)
      state.lastFetched = Date.now()
    })

    // Update Event
    builder.addCase(updateEventThunk.fulfilled, (state, action) => {
      const index = state.events.findIndex((e) => e.$id === action.payload.$id)
      if (index !== -1) {
        state.events[index] = action.payload
      }
      if (state.selectedEvent?.$id === action.payload.$id) {
        state.selectedEvent = action.payload
      }
      state.lastFetched = Date.now()
    })

    // Delete Event
    builder.addCase(deleteEventThunk.fulfilled, (state, action) => {
      state.events = state.events.filter((e) => e.$id !== action.payload)
      if (state.selectedEvent?.$id === action.payload) {
        state.selectedEvent = null
      }
      state.lastFetched = Date.now()
    })
  },
})

export const { setSelectedEvent, invalidateEventsCache } = eventsSlice.actions
export default eventsSlice.reducer
