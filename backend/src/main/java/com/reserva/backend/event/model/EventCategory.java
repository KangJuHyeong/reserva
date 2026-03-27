package com.reserva.backend.event.model;

public enum EventCategory {
    CONCERT("Concert"),
    RESTAURANT("Restaurant"),
    ART_AND_DESIGN("Art & Design"),
    SPORTS("Sports"),
    OTHER("Other");

    private final String label;

    EventCategory(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static EventCategory fromLabel(String raw) {
        for (EventCategory category : values()) {
            if (category.label.equalsIgnoreCase(raw)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Unsupported category: " + raw);
    }
}
