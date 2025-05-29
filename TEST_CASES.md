# Test Cases for Tagged Image Functionality

## I. Unit Test Cases (Primarily for `src/components/ImageUploader.tsx`)

### A. Tag Input & Validation
-   **Valid Tags:**
    -   [ ] Test: Input a single valid tag (e.g., "landscape").
        -   Expected: Tag is accepted, stored, and reflected in `onFileSelect`. No error shown.
    -   [ ] Test: Input multiple valid tags, comma-separated (e.g., "event, indoor, setup").
        -   Expected: Tags are parsed, accepted, stored. No error shown.
    -   [ ] Test: Input a tag with spaces (e.g., "outdoor venue").
        -   Expected: Tag is accepted.
    -   [ ] Test: Input a tag at minimum allowed length (e.g., "ab" if min length is 2).
        -   Expected: Tag is accepted.
    -   [ ] Test: Input a tag at maximum allowed length (e.g., a 30-character valid string if max is 30).
        -   Expected: Tag is accepted.
    -   [ ] Test: Input tags with leading/trailing spaces (e.g., "  tag1  ,  tag2  ").
        -   Expected: Spaces are trimmed, tags ("tag1", "tag2") are accepted.
    -   [ ] Test: Clear tag input after entering tags.
        -   Expected: Tags array for the file becomes empty. No error.
-   **Invalid Tags - Character Validation:**
    -   [ ] Test: Input a tag with special characters (e.g., "event!").
        -   Expected: Tag is rejected. Error message regarding invalid characters is shown. `onFileSelect` does not include this tag.
    -   [ ] Test: Input a tag with only special characters (e.g., "!@#").
        -   Expected: Tag is rejected. Error message shown.
-   **Invalid Tags - Length Validation:**
    -   [ ] Test: Input a tag shorter than minimum length (e.g., "a" if min length is 2).
        -   Expected: Tag is rejected. Error message regarding minimum length is shown.
    -   [ ] Test: Input a tag longer than maximum length (e.g., a 31-character string if max is 30).
        -   Expected: Tag is rejected. Error message regarding maximum length is shown.
-   **Invalid Tags - Count Validation:**
    -   [ ] Test: Input more tags than allowed (e.g., 6 tags if max is 5).
        -   Expected: Input is accepted up to the 5th valid tag. The 6th (and subsequent) valid tags cause an error message regarding max tag count. Only the allowed number of valid tags are stored/emitted.
    -   [ ] Test: Input mixed valid and invalid tags where valid ones exceed max count.
        -   Expected: Invalid tags are rejected first. Then, if remaining valid tags still exceed count, count error is shown.
-   **Tag Parsing & Duplicates:**
    -   [ ] Test: Input comma-separated tags with varied spacing (e.g., "tag1,tag2 , tag3").
        -   Expected: Tags are parsed correctly ("tag1", "tag2", "tag3").
    -   [ ] Test: Input duplicate tags (e.g., "event, event, indoor").
        -   Expected: Duplicate "event" is handled (stored once). No error specifically for duplication, but final tag list is unique.
-   **Validation Feedback & UI:**
    -   [ ] Test: On invalid tag input, verify error message appears below the input.
    -   [ ] Test: On invalid tag input, verify input field border changes (e.g., to red).
    -   [ ] Test: After correcting an invalid tag to a valid one, verify error message disappears and border returns to normal.
    -   [ ] Test: Verify committed valid tags are displayed (e.g., as badges).

### B. `onFileSelect` Output
-   [ ] Test: Add a file and assign it valid tags.
    -   Expected: `onFileSelect` is called. Output is `[{ file: File, tags: ["validTag1", "validTag2"] }]`.
-   [ ] Test: Add a file and leave tags empty.
    -   Expected: `onFileSelect` is called. Output is `[{ file: File, tags: [] }]`.
-   [ ] Test: Add multiple files with different sets of valid tags.
    -   Expected: `onFileSelect` output contains all files, each with its correct, validated tags.
-   [ ] Test: Type invalid tags into the input field for a file.
    -   Expected: The `tags` array for that file within the `onFileSelect` output reflects the *last known valid state* (or empty if no valid tags were ever committed), not the current invalid input.

### C. File Handling
-   [ ] Test: Add a single file.
    -   Expected: File preview is shown. Tag input is available.
-   [ ] Test: Add multiple files up to `maxFiles` limit.
    -   Expected: All files are shown with individual tag inputs.
-   [ ] Test: Attempt to add more files than `maxFiles` limit.
    -   Expected: Alert/message shown, and excess files are not added.
-   [ ] Test: Add a file, add tags, then remove the file.
    -   Expected: File is removed from display. `onFileSelect` is called with the updated list. Associated tag data/errors for that file are cleared.
-   [ ] Test: Add multiple files, assign tags to some, leave others untagged, remove a file with tags.
    -   Expected: Correct file is removed. `onFileSelect` reflects this.
-   [ ] Test: Add multiple files, assign tags to some, leave others untagged, remove a file without tags.
    -   Expected: Correct file is removed. `onFileSelect` reflects this.

## II. Integration Test Cases

### A. Vendor Onboarding (`src/pages/VendorOnboarding.tsx`)
-   [ ] Test: Select multiple venue photos, add a single valid tag to all using a (hypothetical) bulk-tag feature, or by tagging each individually with the same tag.
    -   Expected: Upon form submission, `portfolio_image_urls` in Supabase should be `{"tagA": ["url1.jpg", "url2.jpg"]}`.
-   [ ] Test: Select multiple venue photos, add different valid tags to each.
    -   Expected: `portfolio_image_urls` in Supabase should reflect the diverse tagging (e.g., `{"tagA": ["url1.jpg"], "tagB": ["url2.jpg"]}`).
-   [ ] Test: Select venue photos, add some tags, leave some photos untagged.
    -   Expected: `portfolio_image_urls` in Supabase should include an "untagged" key (or similar default) for URLs without specific tags (e.g., `{"tagA": ["url1.jpg"], "untagged": ["url2.jpg"]}`).
-   [ ] Test: Select venue photos, provide no tags for any.
    -   Expected: All image URLs are grouped under the "untagged" key in `portfolio_image_urls`.
-   [ ] Test (Negative): Attempt to submit the onboarding form while a venue photo in `ImageUploader` has an invalid tag entered (e.g., "tag!!").
    -   Expected: `ImageUploader` should prevent this state from being passed up. The `onFileSelect` in `VendorOnboarding` should receive data that reflects the last valid state of tags. The form submission should proceed based on that valid data or empty tags if none were valid. No specific error at the `VendorOnboarding` form level due to *tag format* if `ImageUploader` works as designed.

### B. Vendor Profile Edit (`src/pages/Profile.tsx`)
-   **Viewing Existing Tagged Images:**
    -   [ ] Test: Load a profile where `portfolio_image_urls` is populated with various tags and URLs.
        -   Expected: Tags are correctly identified and displayed as tabs or filter options. Images are grouped correctly under each tag.
    -   [ ] Test: Load a profile with images under a "general" or "untagged" key.
        -   Expected: These images are displayed correctly, perhaps in a default "Untagged" or "General" tab/section.
    -   [ ] Test: Navigate between different tag tabs/filters.
        -   Expected: Image display updates correctly to show only images for the selected tag.
-   **Editing Tagged Images:**
    -   [ ] Test: Add a new image with one or more new tags.
        -   Expected: Image is uploaded. New tags and the new URL are added to `editedData.portfolio_image_urls`.
    -   [ ] Test: Add a new image with existing tags.
        -   Expected: Image is uploaded. URL is added to the existing tag(s) arrays in `editedData.portfolio_image_urls`.
    -   [ ] Test: Add a new image with no tags.
        -   Expected: Image is uploaded. URL is added to the "untagged" (or default) tag array.
    -   [ ] Test: Remove an individual image from a specific tag group.
        -   Expected: The URL is removed from that tag's array. If the tag array becomes empty, the tag key might be removed (depending on implementation) or remain with an empty array.
    -   [ ] Test: Remove an entire tag group (e.g., click "Remove Tag 'landscape'").
        -   Expected: The tag key and all its associated URLs are removed from `editedData.portfolio_image_urls`.
    -   [ ] Test: Perform a mix of additions and removals, then save.
        -   Expected: All changes are correctly reflected in Supabase after saving. Re-fetch/re-load profile to confirm.
-   **Error Handling During Edit:**
    -   [ ] Test: Attempt to add a new image via `ImageUploader` but enter invalid tags.
        -   Expected: `ImageUploader` shows validation errors. The invalid tags are not added to `editedData.portfolio_image_urls`.
    -   [ ] Test: Image upload failure when adding new images.
        -   Expected: User-friendly error message (toast) is displayed. `editedData.portfolio_image_urls` should not be updated with URLs that failed to upload.

### C. Staff Portfolio Management (`src/components/staff/StaffPortfolioManager.tsx`)
-   [ ] Test: Create a new portfolio item, add multiple images with different valid tags using the `ImageUploader`.
    -   Expected: Item is created. `image_urls` field in Supabase (`staff_portfolios` table) contains the correct JSONB structure (e.g., `{"decor": ["urlA.jpg"], "setup": ["urlB.jpg"]}`).
-   [ ] Test: Create a new portfolio item with images but no tags.
    -   Expected: `image_urls` in Supabase contains URLs under the "untagged" key.
-   [ ] Test: Edit an existing staff portfolio item:
    -   [ ] Load item into the form. Verify existing tagged images (if any) are displayed correctly for editing.
    -   [ ] Add new images with new/existing tags.
        -   Expected: New images are uploaded, URLs and tags are merged into the item's `image_urls`.
    -   [ ] Remove an image from a tag.
        -   Expected: URL removed from the tag in `image_urls`.
    -   [ ] Remove an entire tag group.
        -   Expected: Tag and its URLs removed from `image_urls`.
    -   [ ] Save changes.
        -   Expected: Changes are persisted in Supabase and correctly displayed when re-loading the item or viewing the list.
-   **List View Display:**
    -   [ ] Test: Verify the list of portfolio items shows a representative image (e.g., first image from a prominent or first tag).
    -   [ ] Test: Verify a summary of tags (e.g., a few tag badges) is displayed on the list item card.

### D. Database Interaction (General)
-   [ ] Test: After saving tagged images from any of the components (`VendorOnboarding`, `Profile`, `StaffPortfolioManager`), directly inspect the Supabase database to confirm the JSONB structure in `vendors.portfolio_image_urls` or `staff_portfolios.image_urls` is as expected.
-   [ ] Test: Fetch data that includes the JSONB `image_urls` field in a component that *displays* it (e.g., a public vendor profile page, if one exists, or the edit forms themselves).
    -   Expected: The JSONB is correctly parsed and images are displayed appropriately according to their tags.

## III. Regression Test Cases

### A. Vendor Profile Page (`src/pages/Profile.tsx`)
-   [ ] Test: Edit and save non-image fields (e.g., vendor name, description, address details).
    -   Expected: These fields are updated correctly without affecting `portfolio_image_urls` or other image fields.
-   [ ] Test: Edit and save `sampleMenuUrls` (using its placeholder uploader).
    -   Expected: `sampleMenuUrls` (string array) is updated correctly. `portfolio_image_urls` remains unaffected.
-   [ ] Test: Edit and save `pastEventPhotoUrls` (using its placeholder uploader).
    -   Expected: `pastEventPhotoUrls` (string array) is updated correctly. `portfolio_image_urls` remains unaffected.
-   [ ] Test: If `portfolio_image_urls` was previously `string[]` (before migration) and is now `null` or empty JSONB, ensure the page doesn't crash and allows adding new tagged images.

### B. Staff Portfolio Management (`src/components/staff/StaffPortfolioManager.tsx`)
-   [ ] Test: Edit and save other portfolio fields (title, description).
    -   Expected: These fields are updated correctly without affecting `image_urls`.
-   [ ] Test: Edit and save `video_urls` (if this functionality is present and uses a simple string array).
    -   Expected: `video_urls` are updated correctly. `image_urls` (JSONB) remains unaffected.

### C. General Application & Error Handling
-   [ ] Test: Navigate through various unrelated parts of the application.
    -   Expected: No new console errors. No crashes or unexpected behavior.
-   [ ] Test: Simulate network error during image upload in `ImageUploader` (if possible, or by failing the upload function).
    -   Expected: User-friendly error message (toast) is displayed by the consuming component (`Profile`, `StaffPortfolioManager`, etc.). State is handled gracefully (e.g., no broken UI).
-   [ ] Test: Ensure all `toast` messages for success/error in the updated components are user-friendly and provide clear information.

This list provides a comprehensive set of test cases to ensure the quality and correctness of the tagged image functionality.
