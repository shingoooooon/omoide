const { ImageAnnotatorClient } = require('@google-cloud/vision');
require('dotenv').config({ path: '.env.local' });

async function testGoogleVisionConnection() {
    console.log('🔍 Google Vision API接続テストを開始します...\n');

    // 環境変数の確認
    console.log('📋 環境変数の確認:');
    console.log('GOOGLE_CLOUD_PROJECT_ID:', process.env.GOOGLE_CLOUD_PROJECT_ID ? '✅ 設定済み' : '❌ 未設定');
    console.log('GOOGLE_CLOUD_CLIENT_EMAIL:', process.env.GOOGLE_CLOUD_CLIENT_EMAIL ? '✅ 設定済み' : '❌ 未設定');
    console.log('GOOGLE_CLOUD_PRIVATE_KEY:', process.env.GOOGLE_CLOUD_PRIVATE_KEY ? '✅ 設定済み' : '❌ 未設定');
    console.log('');

    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_CLIENT_EMAIL || !process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
        console.log('❌ 必要な環境変数が設定されていません。');
        return;
    }

    try {
        // Google Vision APIクライアントの初期化
        const credentials = {
            type: 'service_account',
            project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
            private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        };

        const client = new ImageAnnotatorClient({
            credentials,
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        });

        console.log('🔧 Google Vision APIクライアントを初期化しました。');

        // テスト用の公開画像URL（顔が写っている画像）
        const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Bananavarieties.jpg/1024px-Bananavarieties.jpg';

        console.log('🖼️  テスト画像で顔検出を実行中...');
        console.log('テスト画像URL:', testImageUrl);

        // 顔検出の実行
        const [result] = await client.faceDetection({
            image: { source: { imageUri: testImageUrl } },
        });

        const faces = result.faceAnnotations || [];

        console.log('\n✅ Google Vision API接続成功！');
        console.log(`🎯 検出された顔の数: ${faces.length}`);

        if (faces.length > 0) {
            const face = faces[0];
            console.log('📊 検出結果の詳細:');
            console.log(`   - 検出信頼度: ${(face.detectionConfidence || 0).toFixed(3)}`);
            console.log(`   - 喜び: ${face.joyLikelihood || 'UNKNOWN'}`);
            console.log(`   - 悲しみ: ${face.sorrowLikelihood || 'UNKNOWN'}`);
            console.log(`   - 怒り: ${face.angerLikelihood || 'UNKNOWN'}`);
            console.log(`   - 驚き: ${face.surpriseLikelihood || 'UNKNOWN'}`);
        }

        console.log('\n🎉 Google Vision APIの設定は正常に動作しています！');

    } catch (error) {
        console.log('\n❌ Google Vision API接続エラー:');
        console.log('エラーメッセージ:', error.message);

        if (error.message.includes('UNAUTHENTICATED')) {
            console.log('\n💡 認証エラーの可能性があります。以下を確認してください:');
            console.log('   1. GOOGLE_CLOUD_PROJECT_IDが正しいか');
            console.log('   2. GOOGLE_CLOUD_CLIENT_EMAILが正しいか');
            console.log('   3. GOOGLE_CLOUD_PRIVATE_KEYが正しいか（改行文字を含む）');
            console.log('   4. サービスアカウントにVision APIの権限があるか');
        } else if (error.message.includes('PERMISSION_DENIED')) {
            console.log('\n💡 権限エラーの可能性があります。以下を確認してください:');
            console.log('   1. Google Cloud ProjectでVision APIが有効になっているか');
            console.log('   2. サービスアカウントに適切な権限が付与されているか');
        } else if (error.message.includes('quota')) {
            console.log('\n💡 クォータエラーの可能性があります:');
            console.log('   1. Vision APIの使用量制限に達していないか確認してください');
        }

        console.log('\n🔗 詳細なエラー情報:');
        console.log(error);
    }
}

// テスト実行
testGoogleVisionConnection().catch(console.error);