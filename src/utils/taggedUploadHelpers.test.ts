import { describe, it, expect } from 'vitest';
import {
  convertToTaggedImages,
  convertForDatabase,
  validateTagName,
  formatTagName,
  getAvailableTags,
  addImagesToTag,
  removeImageFromTag,
  getSuggestedTags,
  type TaggedImages,
} from './taggedUploadHelpers';

describe('taggedUploadHelpers', () => {
  describe('convertToTaggedImages', () => {
    it('should return null for null input', () => {
      expect(convertToTaggedImages(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(convertToTaggedImages(undefined)).toBeNull();
    });

    it('should preserve object format', () => {
      const input = { Portfolio: ['url1.jpg', 'url2.jpg'] };
      expect(convertToTaggedImages(input)).toEqual(input);
    });

    it('should convert array to Portfolio tag', () => {
      const input = ['url1.jpg', 'url2.jpg'];
      expect(convertToTaggedImages(input)).toEqual({
        Portfolio: ['url1.jpg', 'url2.jpg'],
      });
    });

    it('should handle empty array', () => {
      expect(convertToTaggedImages([])).toEqual({ Portfolio: [] });
    });
  });

  describe('convertForDatabase', () => {
    it('should return null for null input', () => {
      expect(convertForDatabase(null)).toBeNull();
    });

    it('should preserve TaggedImages format', () => {
      const input: TaggedImages = {
        Portfolio: ['url1.jpg'],
        Gallery: ['url2.jpg', 'url3.jpg'],
      };
      expect(convertForDatabase(input)).toEqual(input);
    });
  });

  describe('validateTagName', () => {
    it('should accept valid tag names', () => {
      expect(validateTagName('Portfolio')).toBe(true);
      expect(validateTagName('Work Samples')).toBe(true);
      expect(validateTagName('Before-After')).toBe(true);
      expect(validateTagName('Test_Tag_123')).toBe(true);
    });

    it('should reject empty tags', () => {
      expect(validateTagName('')).toBe(false);
    });

    it('should reject tags longer than 50 characters', () => {
      const longTag = 'a'.repeat(51);
      expect(validateTagName(longTag)).toBe(false);
    });

    it('should reject tags with special characters', () => {
      expect(validateTagName('Tag@Name')).toBe(false);
      expect(validateTagName('Tag#Name')).toBe(false);
      expect(validateTagName('Tag$Name')).toBe(false);
    });
  });

  describe('formatTagName', () => {
    it('should trim whitespace', () => {
      expect(formatTagName('  Portfolio  ')).toBe('Portfolio');
    });

    it('should normalize multiple spaces', () => {
      expect(formatTagName('Work    Samples')).toBe('Work Samples');
    });

    it('should handle mixed whitespace', () => {
      expect(formatTagName('  Before   After  ')).toBe('Before After');
    });
  });

  describe('getAvailableTags', () => {
    it('should return empty array for null input', () => {
      expect(getAvailableTags(null)).toEqual([]);
    });

    it('should return tags with images', () => {
      const input: TaggedImages = {
        Portfolio: ['url1.jpg'],
        Gallery: ['url2.jpg'],
        Empty: [],
      };
      expect(getAvailableTags(input)).toEqual(['Portfolio', 'Gallery']);
    });

    it('should exclude empty tags', () => {
      const input: TaggedImages = {
        Portfolio: [],
        Gallery: ['url1.jpg'],
      };
      expect(getAvailableTags(input)).toEqual(['Gallery']);
    });
  });

  describe('addImagesToTag', () => {
    it('should create new tag if it does not exist', () => {
      const result = addImagesToTag(null, 'Portfolio', ['url1.jpg']);
      expect(result).toEqual({
        Portfolio: ['url1.jpg'],
      });
    });

    it('should append to existing tag', () => {
      const current: TaggedImages = {
        Portfolio: ['url1.jpg'],
      };
      const result = addImagesToTag(current, 'Portfolio', ['url2.jpg']);
      expect(result).toEqual({
        Portfolio: ['url1.jpg', 'url2.jpg'],
      });
    });

    it('should preserve other tags', () => {
      const current: TaggedImages = {
        Portfolio: ['url1.jpg'],
        Gallery: ['url2.jpg'],
      };
      const result = addImagesToTag(current, 'Portfolio', ['url3.jpg']);
      expect(result).toEqual({
        Portfolio: ['url1.jpg', 'url3.jpg'],
        Gallery: ['url2.jpg'],
      });
    });
  });

  describe('removeImageFromTag', () => {
    it('should remove image from tag', () => {
      const current: TaggedImages = {
        Portfolio: ['url1.jpg', 'url2.jpg'],
      };
      const result = removeImageFromTag(current, 'Portfolio', 'url1.jpg');
      expect(result).toEqual({
        Portfolio: ['url2.jpg'],
      });
    });

    it('should delete tag if last image is removed', () => {
      const current: TaggedImages = {
        Portfolio: ['url1.jpg'],
      };
      const result = removeImageFromTag(current, 'Portfolio', 'url1.jpg');
      expect(result).toEqual({});
    });

    it('should preserve other tags', () => {
      const current: TaggedImages = {
        Portfolio: ['url1.jpg'],
        Gallery: ['url2.jpg'],
      };
      const result = removeImageFromTag(current, 'Portfolio', 'url1.jpg');
      expect(result).toEqual({
        Gallery: ['url2.jpg'],
      });
    });

    it('should handle non-existent tag gracefully', () => {
      const current: TaggedImages = {
        Portfolio: ['url1.jpg'],
      };
      const result = removeImageFromTag(current, 'NonExistent', 'url1.jpg');
      expect(result).toEqual(current);
    });
  });

  describe('getSuggestedTags', () => {
    it('should return venue tags for venue category', () => {
      const tags = getSuggestedTags('venue');
      expect(tags).toContain('Exterior');
      expect(tags).toContain('Interior');
      expect(tags).toContain('Ceremony Space');
    });

    it('should return photography tags for photography category', () => {
      const tags = getSuggestedTags('photography');
      expect(tags).toContain('Wedding Photos');
      expect(tags).toContain('Portrait');
    });

    it('should return general tags for unknown category', () => {
      const tags = getSuggestedTags('unknown');
      expect(tags).toContain('Portfolio');
      expect(tags).toContain('Work Samples');
    });

    it('should return general tags for empty category', () => {
      const tags = getSuggestedTags('');
      expect(tags).toContain('Portfolio');
    });
  });
});
