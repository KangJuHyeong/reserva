"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Calendar, Clock, MapPin, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = ["Concert", "Restaurant", "Art & Design", "Sports"];

export default function CreateReservationPage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    location: "",
    date: "",
    time: "",
    reservationOpenDate: "",
    reservationOpenTime: "",
    totalSlots: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    alert("Reservation created successfully!");
    window.location.href = "/";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Reservation</h1>
          <p className="text-muted-foreground mt-2">Fill in the details to create a new reservation event</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-secondary p-3 mb-3">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">Upload cover image</p>
              <p className="text-sm text-muted-foreground mt-1">Drag and drop or click to upload</p>
              <Button type="button" variant="outline" className="mt-4 border-border">
                Choose File
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Event Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              className="h-11 w-full rounded-lg border border-border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border border-border bg-input px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows={4}
              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                Price per person
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-11 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="totalSlots" className="block text-sm font-medium text-foreground mb-2">
                Total Spots
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="totalSlots"
                  name="totalSlots"
                  type="number"
                  min="1"
                  value={formData.totalSlots}
                  onChange={handleChange}
                  placeholder="100"
                  className="h-11 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter venue address"
                className="h-11 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          {/* Event Date & Time Section */}
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Event Date & Time
            </h3>
            <p className="text-xs text-muted-foreground mb-4">When the event will take place</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                  Event Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-foreground mb-2">
                  Event Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Open Time Section */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Reservation Open Time
            </h3>
            <p className="text-xs text-muted-foreground mb-4">When participants can start joining the reservation. This is separate from the actual event time.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reservationOpenDate" className="block text-sm font-medium text-foreground mb-2">
                  Open Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="reservationOpenDate"
                    name="reservationOpenDate"
                    type="date"
                    value={formData.reservationOpenDate}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reservationOpenTime" className="block text-sm font-medium text-foreground mb-2">
                  Open Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="reservationOpenTime"
                    name="reservationOpenTime"
                    type="time"
                    value={formData.reservationOpenTime}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-primary/80">
              Tip: Set the reservation open time before the event date to give participants time to reserve their spots.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Link href="/" className="flex-1">
              <Button type="button" variant="outline" className="w-full h-11 border-border">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Reservation"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
