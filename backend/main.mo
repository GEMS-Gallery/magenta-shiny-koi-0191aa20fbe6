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

actor {
  // Types
  type Photo = {
    id: Nat;
    title: Text;
    category: Text;
    url: Text;
    likes: Nat;
    comments: [Comment];
    timestamp: Int;
  };

  type Comment = {
    author: ?Text;
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

  public func addPhoto(title: Text, category: Text, url: Text) : async Result.Result<Nat, Text> {
    let newPhoto : Photo = {
      id = nextPhotoId;
      title = title;
      category = category;
      url = url;
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

  public func addComment(photoId: Nat, content: Text) : async Result.Result<(), Text> {
    switch (findPhoto(photoId)) {
      case null { #err("Photo not found") };
      case (?photo) {
        let newComment : Comment = {
          author = null;
          content = content;
          timestamp = Time.now();
        };
        let updatedPhoto = {
          id = photo.id;
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
