from flask import Blueprint, request, jsonify

# これがFastAPIでいう「router = APIRouter()」にあたります
posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/', methods=['POST'])
def create_post():
    # ここにしおり作成ロジックを書く
    return jsonify({"message": "しおり作成"}), 201