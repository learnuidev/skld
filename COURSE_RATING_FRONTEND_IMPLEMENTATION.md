# Course Rating Frontend Implementation

## Overview

Added course rating functionality to the frontend, including rating banners, star displays, and the ability to rate courses.

## Files Created

### Components

1. **components/star-rating.tsx** - Reusable star rating component

   - Displays 1-5 stars based on rating value
   - Shows count of ratings when available
   - Supports interactive mode for rating selection
   - Three size options: sm, md, lg

2. **components/course-rating-banner.tsx** - Rating prompt banner
   - Shows when user is enrolled for 10+ days
   - Only displays if user hasn't rated yet
   - Interactive star selection with number buttons
   - Submit button with loading state
   - Dismissible banner with close button

### Queries

3. **modules/user-course-rating/use-get-user-course-rating-query.ts**
   - Fetches user's rating for a specific course
   - Returns null if user hasn't rated
   - Handles 404 responses gracefully
   - Auto-disabled when no courseId

## Files Modified

### Pages

1. **app/courses/[courseId]/page.tsx**

   - Added import for CourseRatingBanner
   - Added import for useGetUserCourseRatingQuery
   - Added state for banner visibility control
   - Displays banner when user is eligible to rate
   - Banner only shows if:
     - User is enrolled
     - User hasn't rated the course yet
     - Enrolled for >= 10 days
   - Banner dismisses after rating submission

2. **app/page.tsx** - Home page

   - Added StarRating component import
   - Displays rating stars and count in featured course section
   - Displays rating stars and count in course cards grid
   - Shows below course title in featured section
   - Shows in bottom-left corner of course cards

3. **components/course-card.tsx** - Course card component
   - Added StarRating component import
   - Displays rating above course description
   - Shows stars and rating count
   - Only displays if course has rating data

## Features Implemented

### 1. Star Rating Display

**Where Used:**

- Home page (featured courses section)
- Home page (course grid)
- Courses page (via CourseCard component)
- Course detail page (via rating banner)

**Display:**

- 5 stars with yellow color for filled stars
- Gray color for unfilled stars
- Rating count in parentheses (e.g., (42))
- Different sizes for different contexts

### 2. Course Rating Banner

**Location:** Course detail page (`/courses/:courseId`)

**Eligibility Criteria:**

1. User is enrolled in the course
2. User has been enrolled for at least 10 days
3. User has not yet rated the course

**Banner Features:**

- Prominent yellow/orange gradient background
- Star icon header
- Days enrolled counter
- Two rating input methods:
  - Interactive star rating (hover/click)
  - Number buttons (1-5)
- Submit button with loading state
- Dismissible with X button
- Auto-dismisses after successful rating submission

**User Experience Flow:**

1. User enrolls in course
2. After 10+ days, banner appears
3. User selects rating (1-5 stars or number)
4. User clicks "Submit Rating"
5. Rating is sent to backend
6. Banner disappears
7. Course's average rating updates

### 3. Rating Statistics

**Data Displayed:**

- Average rating (e.g., 4.3 stars)
- Total number of ratings (e.g., 42 ratings)
- Visual representation with star icons

**Where Displayed:**

- Featured courses on home page
- Course cards on home page
- Course cards on courses page
- Course detail header (via mutation invalidation)

## Component Props

### StarRating

```typescript
interface StarRatingProps {
  rating?: number; // Average rating value (0-5)
  count?: number; // Number of ratings
  size?: "sm" | "md" | "lg"; // Icon size
  showCount?: boolean; // Whether to show count
  interactive?: boolean; // Enable clicking stars
  onRatingChange?: (rating: number) => void; // Rating change callback
}
```

### CourseRatingBanner

```typescript
interface CourseRatingBannerProps {
  courseId: string; // Course ID to rate
  enrolledAt: number; // Enrollment timestamp
  onRated?: () => void; // Callback after successful rating
}
```

## Query Behavior

### useGetUserCourseRatingQuery

- **Enabled:** When courseId is provided
- **Cache Key:** `["userCourseRating", courseId]`
- **Return Type:** `UserCourseRating | null`
- **Invalidation:** Triggered by useAddUserCourseRatingMutation onSuccess

**Response Handling:**

- **200:** Returns user's rating
- **404:** Returns null (user hasn't rated)
- **Other Errors:** Throws error message

## Visual Design

### Color Scheme

- **Filled Stars:** Yellow-400 (#FACC15)
- **Empty Stars:** Muted-foreground (gray)
- **Banner Background:** Gradient from yellow-500/10 to orange-500/10
- **Banner Border:** Yellow-500/20
- **Star Icon:** Yellow-600

### Layout

- **Banner:** Full width with padding, dismissible
- **Rating Display:** Horizontal stars with count
- **Input Methods:** Side-by-side for accessibility
  - Left: Interactive star rating
  - Right: Number buttons (1-5)

## Accessibility

- ARIA labels on star buttons
- Keyboard accessible rating buttons
- Clear visual feedback on hover
- Semantic HTML structure
- Proper focus states

## Edge Cases Handled

1. **No Rating Data:** Component displays nothing (no null errors)
2. **Zero Rating:** Shows 0 unfilled stars
3. **Fractional Ratings:** Rounds to nearest star
4. **User Already Rated:** Banner doesn't appear
5. **New Enrollment:** Banner doesn't appear (< 10 days)
6. **Not Enrolled:** Banner doesn't appear

## Integration Points

### Mutation Integration

```typescript
const addRatingMutation = useAddUserCourseRatingMutation();

await addRatingMutation.mutateAsync({ courseId, rating });
```

### Query Invalidation

The mutation automatically invalidates:

- `["enrollments"]` - Shows updated enrollment data
- `["courses", courseId]` - Shows updated course rating
- `["public-courses"]` - Shows updated public courses

This means rating displays update automatically across all pages after submission.

## Next Steps

To complete the feature:

1. **Deploy Backend Changes:**

   ```bash
   cd skld-backend
   serverless deploy
   ```

2. **Test Rating Flow:**

   - Create a test enrollment 10+ days ago
   - Verify banner appears
   - Submit a rating
   - Verify banner disappears
   - Verify rating appears on course cards

3. **Consider Adding:**
   - User's own rating indicator (e.g., "You rated this 4 stars")
   - Rating history section in user profile
   - Sort/filter courses by rating

## Testing Checklist

- [ ] Banner appears after 10 days
- [ ] Banner doesn't appear before 10 days
- [ ] Banner doesn't appear if already rated
- [ ] Banner doesn't appear if not enrolled
- [ ] Stars display correctly in home page featured section
- [ ] Stars display correctly in home page course grid
- [ ] Stars display correctly in courses page
- [ ] Rating submission succeeds
- [ ] Rating submission updates course statistics
- [ ] Banner dismisses after rating
- [ ] All pages show updated rating after submission
