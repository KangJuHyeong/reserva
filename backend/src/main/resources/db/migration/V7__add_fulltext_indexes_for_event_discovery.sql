ALTER TABLE events
    ADD FULLTEXT INDEX ft_events_search (title, description, location);

ALTER TABLE users
    ADD FULLTEXT INDEX ft_users_display_name (display_name);
