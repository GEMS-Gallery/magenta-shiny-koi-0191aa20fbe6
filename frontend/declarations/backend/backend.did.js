export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Comment = IDL.Record({
    'content' : IDL.Text,
    'author' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Int,
  });
  const Photo = IDL.Record({
    'id' : IDL.Nat,
    'url' : IDL.Text,
    'title' : IDL.Text,
    'likes' : IDL.Nat,
    'timestamp' : IDL.Int,
    'category' : IDL.Text,
    'comments' : IDL.Vec(Comment),
  });
  return IDL.Service({
    'addComment' : IDL.Func([IDL.Nat, IDL.Text], [Result], []),
    'addPhoto' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_1], []),
    'getPhotos' : IDL.Func([], [IDL.Vec(Photo)], ['query']),
    'likePhoto' : IDL.Func([IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
