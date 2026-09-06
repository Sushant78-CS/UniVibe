import api from "./axios";

export interface Event {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
  registrationDeadline: string | null;
  capacity: number | null;
  registrationEnabled: boolean;
  organizerName: string | null;
  createdAt: string;

  // Registration status
  registrationCount: number;
  registeredByCurrentUser: boolean;
  registrationOpen: boolean;
}

export interface CreateEventRequest {
  title: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
  registrationDeadline: string | null;
  capacity: number | null;
  registrationEnabled: boolean;
}

export const getEvents = async (token: string): Promise<Event[]> => {
  const response = await api.get<Event[]>("/events", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getEvent = async (
  token: string,
  eventId: number,
): Promise<Event> => {
  const response = await api.get<Event>(`/events/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createEvent = async (
  token: string,
  request: CreateEventRequest,
): Promise<Event> => {
  const response = await api.post<Event>("/events", request, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateEvent = async (
  token: string,
  eventId: number,
  request: CreateEventRequest,
): Promise<Event> => {
  const response = await api.put<Event>(`/events/${eventId}`, request, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteEvent = async (
  token: string,
  eventId: number,
): Promise<void> => {
  await api.delete(`/events/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// -----------------------------
// Registration Form
// -----------------------------

export interface RegistrationQuestionRequest {
  question: string;

  type:
    | "TEXT"
    | "EMAIL"
    | "PHONE"
    | "NUMBER"
    | "TEXTAREA"
    | "SELECT"
    | "RADIO"
    | "CHECKBOX";

  required: boolean;

  options: string | null;

  displayOrder: number;
}

export interface RegistrationFormRequest {
  questions: RegistrationQuestionRequest[];
}

export interface RegistrationQuestionResponse extends RegistrationQuestionRequest {
  id: number;
}

export interface RegistrationFormResponse {
  id: number;
  eventId: number;
  createdAt: string;
  questions: RegistrationQuestionResponse[];
}

export const createRegistrationForm = async (
  token: string,
  eventId: number,
  request: RegistrationFormRequest,
): Promise<RegistrationFormResponse> => {
  const response = await api.post<RegistrationFormResponse>(
    `/events/${eventId}/registration-form`,
    request,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getRegistrationForm = async (
  token: string,
  eventId: number,
): Promise<RegistrationFormResponse> => {
  const response = await api.get<RegistrationFormResponse>(
    `/events/${eventId}/registration-form`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const updateRegistrationForm = async (
  token: string,
  eventId: number,
  request: RegistrationFormRequest,
): Promise<RegistrationFormResponse> => {
  const response = await api.put<RegistrationFormResponse>(
    `/events/${eventId}/registration-form`,
    request,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// -----------------------------
// Event Registration
// -----------------------------

export interface RegistrationAnswerRequest {
  questionId: number;
  answer: string | null;
}

export interface EventRegistrationRequest {
  answers: RegistrationAnswerRequest[];
}

export interface EventRegistrationResponse {
  id: number;
  eventId: number;
  submittedAt: string;
}

export const registerForEvent = async (
  token: string,
  eventId: number,
  request: EventRegistrationRequest,
): Promise<EventRegistrationResponse> => {
  const response = await api.post<EventRegistrationResponse>(
    `/events/${eventId}/register`,
    request,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export interface RegistrationAnswerResponse {
  questionId: number;
  question: string;
  answer: string | null;
}

export interface EventRegistrationResponse {
  registrationId: number;
  userId: number;
  studentName: string | null;
  username: string | null;
  submittedAt: string;
  answers: RegistrationAnswerResponse[];
}

export const getEventRegistrations = async (
  token: string,
  eventId: number,
): Promise<EventRegistrationResponse[]> => {
  const response = await api.get<EventRegistrationResponse[]>(
    `/events/${eventId}/registrations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
