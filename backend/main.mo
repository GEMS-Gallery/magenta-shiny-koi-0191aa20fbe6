import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Blob "mo:base/Blob";

actor {
  // Types
  type Photo = {
    id: Nat;
    username: Text;
    title: Text;
    category: Text;
    url: Text;
    likes: Nat;
    comments: [Comment];
    timestamp: Int;
  };

  type Comment = {
    username: Text;
    content: Text;
    timestamp: Int;
  };

  // Stable storage
  stable var photos : [Photo] = [];
  stable var nextPhotoId : Nat = 0;

  // Helper functions
  func findPhoto(id: Nat) : ?Photo {
    Array.find(photos, func (p: Photo) : Bool { p.id == id })
  };

  // API methods
  public query func getPhotos() : async [Photo] {
    Array.sort(photos, func(a: Photo, b: Photo) : { #less; #equal; #greater } {
      Int.compare(b.timestamp, a.timestamp)
    })
  };

  public query func getPhotosByCategory(category: Text) : async [Photo] {
    Array.filter(photos, func (p: Photo) : Bool { p.category == category })
  };

  public func addPhoto(username: Text, title: Text, category: Text, imageBlob: Blob) : async Result.Result<Nat, Text> {
    // In a real-world scenario, you would save the imageBlob and generate a URL
    // For this example, we'll just use a placeholder URL
    let imageUrl = "/api/placeholder/614/614";
    
    let newPhoto : Photo = {
      id = nextPhotoId;
      username = username;
      title = title;
      category = category;
      url = imageUrl;
      likes = 0;
      comments = [];
      timestamp = Time.now();
    };
    photos := Array.append(photos, [newPhoto]);
    nextPhotoId += 1;
    #ok(newPhoto.id)
  };

  public func likePhoto(photoId: Nat) : async Result.Result<(), Text> {
    switch (findPhoto(photoId)) {
      case null { #err("Photo not found") };
      case (?photo) {
        let updatedPhoto = {
          id = photo.id;
          username = photo.username;
          title = photo.title;
          category = photo.category;
          url = photo.url;
          likes = photo.likes + 1;
          comments = photo.comments;
          timestamp = photo.timestamp;
        };
        photos := Array.map(photos, func (p: Photo) : Photo {
          if (p.id == photoId) { updatedPhoto } else { p }
        });
        #ok()
      };
    }
  };

  public func addComment(photoId: Nat, username: Text, content: Text) : async Result.Result<(), Text> {
    switch (findPhoto(photoId)) {
      case null { #err("Photo not found") };
      case (?photo) {
        let newComment : Comment = {
          username = username;
          content = content;
          timestamp = Time.now();
        };
        let updatedPhoto = {
          id = photo.id;
          username = photo.username;
          title = photo.title;
          category = photo.category;
          url = photo.url;
          likes = photo.likes;
          comments = Array.append(photo.comments, [newComment]);
          timestamp = photo.timestamp;
        };
        photos := Array.map(photos, func (p: Photo) : Photo {
          if (p.id == photoId) { updatedPhoto } else { p }
        });
        #ok()
      };
    }
  };
}
