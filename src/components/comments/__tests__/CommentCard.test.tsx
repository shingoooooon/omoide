import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentCard } from '../CommentCard';
import { GrowthComment } from '@/lib/commentGenerationService';

// window.confirm のモック
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn()
});

describe('CommentCard', () => {
  const mockComment: GrowthComment = {
    id: 'comment-1',
    photoId: 'photo-1',
    content: 'テストコメント',
    generatedAt: new Date('2024-01-01T10:00:00Z'),
    isEdited: false
  };

  const mockOnCommentUpdate = jest.fn();
  const mockOnCommentDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('コメントを正しく表示する', () => {
    render(
      <CommentCard
        comment={mockComment}
        onCommentUpdate={mockOnCommentUpdate}
      />
    );

    expect(screen.getByText('テストコメント')).toBeInTheDocument();
    expect(screen.getByText('編集')).toBeInTheDocument();
  });

  it('写真URLが提供された場合、画像を表示する', () => {
    render(
      <CommentCard
        comment={mockComment}
        photoUrl="https://example.com/photo.jpg"
        onCommentUpdate={mockOnCommentUpdate}
      />
    );

    const image = screen.getByAltText('成長記録の写真');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('編集モードに切り替えられる', async () => {
    const user = userEvent.setup();
    
    render(
      <CommentCard
        comment={mockComment}
        onCommentUpdate={mockOnCommentUpdate}
      />
    );

    await user.click(screen.getByText('編集'));

    expect(screen.getByDisplayValue('テストコメント')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('コメントを編集して保存できる', async () => {
    const user = userEvent.setup();
    
    render(
      <CommentCard
        comment={mockComment}
        onCommentUpdate={mockOnCommentUpdate}
      />
    );

    // 編集モードに切り替え
    await user.click(screen.getByText('編集'));

    // テキストを変更
    const textarea = screen.getByDisplayValue('テストコメント');
    await user.clear(textarea);
    await user.type(textarea, '更新されたコメント');

    // 保存
    await user.click(screen.getByText('保存'));

    expect(mockOnCommentUpdate).toHaveBeenCalledWith('comment-1', '更新されたコメント');
  });

  it('編集をキャンセルできる', async () => {
    const user = userEvent.setup();
    
    render(
      <CommentCard
        comment={mockComment}
        onCommentUpdate={mockOnCommentUpdate}
      />
    );

    // 編集モードに切り替え
    await user.click(screen.getByText('編集'));

    // テキストを変更
    const textarea = screen.getByDisplayValue('テストコメント');
    await user.clear(textarea);
    await user.type(textarea, '変更されたテキスト');

    // キャンセル
    await user.click(screen.getByText('キャンセル'));

    // 元のコメントが表示されることを確認
    expect(screen.getByText('テストコメント')).toBeInTheDocument();
    expect(mockOnCommentUpdate).not.toHaveBeenCalled();
  });

  it('削除機能が提供された場合、削除ボタンを表示する', () => {
    render(
      <CommentCard
        comment={mockComment}
        onCommentUpdate={mockOnCommentUpdate}
        onCommentDelete={mockOnCommentDelete}
      />
    );

    expect(screen.getByText('削除')).toBeInTheDocument();
  });

  it('削除確認ダイアログでOKした場合、削除処理を実行する', async () => {
    const user = userEvent.setup();
    (window.confirm as jest.Mock).mockReturnValue(true);
    
    render(
      <CommentCard
        comment={mockComment}
        onCommentUpdate={mockOnCommentUpdate}
        onCommentDelete={mockOnCommentDelete}
      />
    );

    await user.click(screen.getByText('削除'));

    expect(window.confirm).toHaveBeenCalledWith('このコメントを削除しますか？');
    expect(mockOnCommentDelete).toHaveBeenCalledWith('comment-1');
  });

  it('削除確認ダイアログでキャンセルした場合、削除処理を実行しない', async () => {
    const user = userEvent.setup();
    (window.confirm as jest.Mock).mockReturnValue(false);
    
    render(
      <CommentCard
        comment={mockComment}
        onCommentUpdate={mockOnCommentUpdate}
        onCommentDelete={mockOnCommentDelete}
      />
    );

    await user.click(screen.getByText('削除'));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnCommentDelete).not.toHaveBeenCalled();
  });

  it('編集済みフラグが表示される', () => {
    const editedComment = { ...mockComment, isEdited: true };
    
    render(
      <CommentCard
        comment={editedComment}
        onCommentUpdate={mockOnCommentUpdate}
      />
    );

    expect(screen.getByText('編集済み')).toBeInTheDocument();
  });

  it('編集不可モードでは編集・削除ボタンが表示されない', () => {
    render(
      <CommentCard
        comment={mockComment}
        onCommentUpdate={mockOnCommentUpdate}
        onCommentDelete={mockOnCommentDelete}
        isEditable={false}
      />
    );

    expect(screen.queryByText('編集')).not.toBeInTheDocument();
    expect(screen.queryByText('削除')).not.toBeInTheDocument();
  });

  it('文字数制限が表示される', async () => {
    const user = userEvent.setup();
    
    render(
      <CommentCard
        comment={mockComment}
        onCommentUpdate={mockOnCommentUpdate}
      />
    );

    await user.click(screen.getByText('編集'));

    expect(screen.getByText(/\/200文字/)).toBeInTheDocument();
  });
});