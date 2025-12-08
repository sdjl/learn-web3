/**
 * 提交至 Etherscan.io 进行验证，日期：2017-11-28
 * USDT 不是加密货币，而是区块链上的电子借据（IOU）。
 */

pragma solidity ^0.4.17;

/**
 * @title SafeMath
 * @dev 提供安全的数学运算，在出错时会抛出异常
 * 这个库用于防止整数溢出和下溢等安全问题
 */
library SafeMath {
    /**
     * @dev 两个数字相乘
     * @param a 第一个乘数
     * @param b 第二个乘数
     * @return 返回 a * b 的结果
     * 如果 a 为 0，直接返回 0 以节省 gas
     * 否则检查结果除以 a 是否等于 b，以确保没有溢出
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b); // 断言没有发生溢出
        return c;
    }

    /**
     * @dev 两个数字相除
     * @param a 被除数
     * @param b 除数
     * @return 返回 a / b 的结果（整数除法，会舍弃小数部分）
     * Solidity 会自动在除以 0 时抛出异常，所以不需要额外检查
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity 在除以 0 时会自动抛出异常
        uint256 c = a / b;
        // assert(a == b * c + a % b); // 这个条件总是成立
        return c;
    }

    /**
     * @dev 两个数字相减
     * @param a 被减数
     * @param b 减数
     * @return 返回 a - b 的结果
     * 要求 b 必须小于等于 a，否则会抛出异常（防止下溢）
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a); // 确保不会发生下溢
        return a - b;
    }

    /**
     * @dev 两个数字相加
     * @param a 第一个加数
     * @param b 第二个加数
     * @return 返回 a + b 的结果
     * 检查结果必须大于等于 a，以确保没有溢出
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a); // 确保不会发生溢出
        return c;
    }
}

/**
 * @title Ownable
 * @dev Ownable 合约有一个所有者地址，并提供基本的授权控制功能
 * 这简化了"用户权限"的实现，只有所有者可以执行某些特权操作
 */
contract Ownable {
    address public owner; // 合约所有者的地址

    /**
     * @dev Ownable 构造函数，将合约的原始所有者设置为部署合约的账户
     * 当合约被部署时，msg.sender（部署者）成为所有者
     */
    function Ownable() public {
        owner = msg.sender;
    }

    /**
     * @dev 修饰器：要求调用者必须是合约所有者
     * 如果调用者不是所有者，交易会失败并回滚
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _; // 继续执行被修饰的函数
    }

    /**
     * @dev 允许当前所有者将合约的控制权转移给新所有者
     * @param newOwner 要转移所有权的新地址
     * 只有当前所有者可以调用此函数
     * 如果新地址不是零地址，则更新所有者
     */
    function transferOwnership(address newOwner) public onlyOwner {
        if (newOwner != address(0)) {
            owner = newOwner;
        }
    }
}

/**
 * @title ERC20Basic
 * @dev ERC20 接口的简化版本
 * @dev 参见 https://github.com/ethereum/EIPs/issues/20
 * 定义了代币的基本功能：总供应量、余额查询和转账
 */
contract ERC20Basic {
    uint public _totalSupply; // 代币总供应量
    function totalSupply() public constant returns (uint); // 返回代币总供应量
    function balanceOf(address who) public constant returns (uint); // 查询指定地址的余额
    function transfer(address to, uint value) public; // 转账给指定地址
    event Transfer(address indexed from, address indexed to, uint value); // 转账事件
}

/**
 * @title ERC20 interface
 * @dev 完整的 ERC20 标准接口
 * @dev 参见 https://github.com/ethereum/EIPs/issues/20
 * 在 ERC20Basic 基础上增加了授权和授权转账功能
 */
contract ERC20 is ERC20Basic {
    function allowance(
        address owner,
        address spender
    ) public constant returns (uint); // 查询授权额度
    function transferFrom(address from, address to, uint value) public; // 从授权的地址转账
    function approve(address spender, uint value) public; // 授权指定地址可以使用的代币数量
    event Approval(address indexed owner, address indexed spender, uint value); // 授权事件
}

/**
 * @title Basic token
 * @dev StandardToken 的基础版本，没有授权功能
 * 实现了基本的转账和余额查询功能
 */
contract BasicToken is Ownable, ERC20Basic {
    using SafeMath for uint; // 使用 SafeMath 库进行安全的数学运算

    mapping(address => uint) public balances; // 存储每个地址的余额

    // 如果将来需要收取交易费用，可以使用以下变量
    uint public basisPointsRate = 0; // 手续费率（以基点为单位，1 基点 = 0.01%）
    uint public maximumFee = 0; // 最大手续费金额

    /**
     * @dev 修饰器：防止 ERC20 短地址攻击
     * 短地址攻击是指攻击者通过发送特制的短地址来操纵转账金额
     * 这个修饰器检查 msg.data 的长度是否足够
     */
    modifier onlyPayloadSize(uint size) {
        require(!(msg.data.length < size + 4)); // 确保数据长度至少为 size + 4 字节
        _;
    }

    /**
     * @dev 将代币转账到指定地址
     * @param _to 接收代币的地址
     * @param _value 要转账的代币数量
     * 如果设置了手续费，会从转账金额中扣除手续费并发送给合约所有者
     */
    function transfer(address _to, uint _value) public onlyPayloadSize(2 * 32) {
        // 计算手续费：转账金额 * 费率 / 10000
        uint fee = (_value.mul(basisPointsRate)).div(10000);
        // 如果计算出的手续费超过最大手续费，则使用最大手续费
        if (fee > maximumFee) {
            fee = maximumFee;
        }
        // 实际发送给接收者的金额 = 转账金额 - 手续费
        uint sendAmount = _value.sub(fee);
        // 从发送者账户扣除转账金额
        balances[msg.sender] = balances[msg.sender].sub(_value);
        // 给接收者账户增加实际转账金额
        balances[_to] = balances[_to].add(sendAmount);
        // 如果有手续费，将手续费转给合约所有者
        if (fee > 0) {
            balances[owner] = balances[owner].add(fee);
            Transfer(msg.sender, owner, fee); // 触发手续费转账事件
        }
        Transfer(msg.sender, _to, sendAmount); // 触发转账事件
    }

    /**
     * @dev 获取指定地址的余额
     * @param _owner 要查询余额的地址
     * @return 返回该地址拥有的代币数量
     */
    function balanceOf(address _owner) public constant returns (uint balance) {
        return balances[_owner];
    }
}

/**
 * @title Standard ERC20 token
 * @dev 实现完整的标准 ERC20 代币
 * @dev 参见 https://github.com/ethereum/EIPs/issues/20
 * @dev 基于 FirstBlood 的代码：https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 * 在 BasicToken 基础上增加了授权转账功能
 */
contract StandardToken is BasicToken, ERC20 {
    // 存储授权信息：allowed[所有者][被授权者] = 授权金额
    mapping(address => mapping(address => uint)) public allowed;

    // uint256 的最大值，用于表示无限授权
    uint public constant MAX_UINT = 2 ** 256 - 1;

    /**
     * @dev 从一个地址转账代币到另一个地址（使用授权额度）
     * @param _from 代币的来源地址（所有者）
     * @param _to 代币的目标地址
     * @param _value 要转账的代币数量
     * 调用者必须事先获得 _from 地址的授权
     */
    function transferFrom(
        address _from,
        address _to,
        uint _value
    ) public onlyPayloadSize(3 * 32) {
        var _allowance = allowed[_from][msg.sender]; // 获取授权额度

        // 不需要检查 _value > _allowance，因为 sub 函数会在条件不满足时抛出异常
        // if (_value > _allowance) throw;

        // 计算手续费
        uint fee = (_value.mul(basisPointsRate)).div(10000);
        if (fee > maximumFee) {
            fee = maximumFee;
        }
        // 如果授权额度不是无限的（MAX_UINT），则减少授权额度
        if (_allowance < MAX_UINT) {
            allowed[_from][msg.sender] = _allowance.sub(_value);
        }
        // 实际发送金额 = 转账金额 - 手续费
        uint sendAmount = _value.sub(fee);
        // 从来源地址扣除代币
        balances[_from] = balances[_from].sub(_value);
        // 给目标地址增加代币
        balances[_to] = balances[_to].add(sendAmount);
        // 如果有手续费，转给合约所有者
        if (fee > 0) {
            balances[owner] = balances[owner].add(fee);
            Transfer(_from, owner, fee); // 触发手续费转账事件
        }
        Transfer(_from, _to, sendAmount); // 触发转账事件
    }

    /**
     * @dev 授权指定地址可以代表 msg.sender 使用的代币数量
     * @param _spender 被授权的地址
     * @param _value 授权的代币数量
     * 为了防止授权竞态条件攻击，如果要修改授权额度，必须先将额度改为 0
     * 参见：https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     */
    function approve(
        address _spender,
        uint _value
    ) public onlyPayloadSize(2 * 32) {
        // 要更改授权额度，必须先通过调用 approve(_spender, 0) 将授权额度减少到零
        // （如果当前授权额度不为 0）以缓解竞态条件问题
        require(!((_value != 0) && (allowed[msg.sender][_spender] != 0)));

        allowed[msg.sender][_spender] = _value; // 设置授权额度
        Approval(msg.sender, _spender, _value); // 触发授权事件
    }

    /**
     * @dev 查询所有者允许被授权者使用的代币数量
     * @param _owner 拥有代币的地址
     * @param _spender 被授权使用代币的地址
     * @return 返回被授权者还可以使用的代币数量
     */
    function allowance(
        address _owner,
        address _spender
    ) public constant returns (uint remaining) {
        return allowed[_owner][_spender];
    }
}

/**
 * @title Pausable
 * @dev 可暂停合约的基础合约，允许子合约实现紧急停止机制
 * 当合约被暂停时，某些功能将无法使用
 */
contract Pausable is Ownable {
    event Pause(); // 暂停事件
    event Unpause(); // 恢复事件

    bool public paused = false; // 合约暂停状态，默认为 false（未暂停）

    /**
     * @dev 修饰器：只有当合约未暂停时才能调用函数
     */
    modifier whenNotPaused() {
        require(!paused); // 要求合约未暂停
        _;
    }

    /**
     * @dev 修饰器：只有当合约已暂停时才能调用函数
     */
    modifier whenPaused() {
        require(paused); // 要求合约已暂停
        _;
    }

    /**
     * @dev 由所有者调用以暂停合约，触发停止状态
     * 只有所有者可以调用，且只能在未暂停时调用
     */
    function pause() public onlyOwner whenNotPaused {
        paused = true; // 将暂停状态设为 true
        Pause(); // 触发暂停事件
    }

    /**
     * @dev 由所有者调用以恢复合约，返回到正常状态
     * 只有所有者可以调用，且只能在已暂停时调用
     */
    function unpause() public onlyOwner whenPaused {
        paused = false; // 将暂停状态设为 false
        Unpause(); // 触发恢复事件
    }
}

/**
 * @title BlackList
 * @dev 黑名单合约，允许合约所有者将地址加入或移出黑名单
 * 黑名单中的地址将无法进行转账等操作，且其资金可以被销毁
 */
contract BlackList is Ownable, BasicToken {
    /////// 提供 getter 函数，允许其他合约（包括升级后的 Tether）使用相同的黑名单 ///////

    /**
     * @dev 获取指定地址的黑名单状态
     * @param _maker 要查询的地址
     * @return 如果地址在黑名单中返回 true，否则返回 false
     */
    function getBlackListStatus(
        address _maker
    ) external constant returns (bool) {
        return isBlackListed[_maker];
    }

    /**
     * @dev 获取合约所有者的地址
     * @return 返回合约所有者地址
     */
    function getOwner() external constant returns (address) {
        return owner;
    }

    // 存储黑名单状态：地址 => 是否在黑名单中
    mapping(address => bool) public isBlackListed;

    /**
     * @dev 将地址加入黑名单
     * @param _evilUser 要加入黑名单的地址
     * 只有合约所有者可以调用
     */
    function addBlackList(address _evilUser) public onlyOwner {
        isBlackListed[_evilUser] = true; // 将地址标记为黑名单
        AddedBlackList(_evilUser); // 触发加入黑名单事件
    }

    /**
     * @dev 将地址从黑名单中移除
     * @param _clearedUser 要移除黑名单的地址
     * 只有合约所有者可以调用
     */
    function removeBlackList(address _clearedUser) public onlyOwner {
        isBlackListed[_clearedUser] = false; // 将地址标记为非黑名单
        RemovedBlackList(_clearedUser); // 触发移除黑名单事件
    }

    /**
     * @dev 销毁黑名单地址中的所有资金
     * @param _blackListedUser 黑名单中的地址
     * 只有合约所有者可以调用，且地址必须在黑名单中
     * 该地址的余额将被清零，总供应量也会相应减少
     */
    function destroyBlackFunds(address _blackListedUser) public onlyOwner {
        require(isBlackListed[_blackListedUser]); // 确保地址在黑名单中
        uint dirtyFunds = balanceOf(_blackListedUser); // 获取该地址的余额
        balances[_blackListedUser] = 0; // 清零该地址的余额
        _totalSupply -= dirtyFunds; // 从总供应量中减去被销毁的金额
        DestroyedBlackFunds(_blackListedUser, dirtyFunds); // 触发销毁资金事件
    }

    event DestroyedBlackFunds(address _blackListedUser, uint _balance); // 销毁黑名单资金事件

    event AddedBlackList(address _user); // 加入黑名单事件

    event RemovedBlackList(address _user); // 移除黑名单事件
}

/**
 * @title UpgradedStandardToken
 * @dev 升级后的标准代币接口
 *
 * 【为什么需要这个功能】
 * 在区块链上，智能合约一旦部署就无法修改。但随着时间推移，可能需要修复bug或添加新功能。
 * USDT采用了"代理模式"来实现合约升级：
 * 1. 旧合约（TetherToken）保留原地址，用户继续与它交互
 * 2. 新合约（UpgradedStandardToken）部署到新地址，包含新的逻辑
 * 3. 旧合约将所有操作转发到新合约执行
 * 这样用户无需更换地址，就能使用升级后的功能
 *
 * 【实现原理】
 * 这是一个接口合约（interface），定义了新合约必须实现的方法。
 * 旧合约通过这些方法将用户的操作转发给新合约处理。
 * 所有方法都带有"ByLegacy"后缀，表示"由旧版合约调用"。
 *
 * 【安全机制】
 * 新合约的实现必须验证 msg.sender 是旧合约地址，防止其他人直接调用这些方法。
 * 这确保了只有通过旧合约的正规流程才能操作用户资金。
 */
contract UpgradedStandardToken is StandardToken {
    /**
     * @dev 由旧合约调用的转账方法
     * @param from 发送者地址（原始调用者）
     * @param to 接收者地址
     * @param value 转账金额
     *
     * 【调用流程】
     * 1. 用户调用旧合约的 transfer(to, value)
     * 2. 旧合约检测到已升级（deprecated = true）
     * 3. 旧合约调用新合约的 transferByLegacy(msg.sender, to, value)
     * 4. 新合约验证调用者是旧合约，然后执行转账
     *
     * 【参数说明】
     * - from: 真正的发送者（用户地址），由旧合约传入
     * - to: 接收者地址
     * - value: 转账金额
     *
     * 【实现要求】
     * 新合约必须检查 msg.sender == 旧合约地址，确保安全性
     */
    function transferByLegacy(address from, address to, uint value) public;

    /**
     * @dev 由旧合约调用的授权转账方法
     * @param sender 原始调用者（执行转账的人）
     * @param from 代币所有者地址（被转走代币的账户）
     * @param spender 授权地址（这个参数在标准实现中可能未使用，保留用于兼容性）
     * @param value 转账金额
     */
    function transferFromByLegacy(
        address sender,
        address from,
        address spender,
        uint value
    ) public;

    /**
     * @dev 由旧合约调用的授权方法
     * @param from 授权者地址（代币所有者）
     * @param spender 被授权者地址（可以转走代币的人）
     * @param value 授权金额
     */
    function approveByLegacy(address from, address spender, uint value) public;
}

/**
 * @title TetherToken
 * @dev Tether (USDT) 代币合约
 * 继承了 Pausable（可暂停）、StandardToken（标准代币）和 BlackList（黑名单）功能
 * 提供了代币发行、赎回、合约升级等高级功能
 */
contract TetherToken is Pausable, StandardToken, BlackList {
    string public name; // 代币名称
    string public symbol; // 代币符号
    uint public decimals; // 小数位数
    address public upgradedAddress; // 升级后的合约地址
    bool public deprecated; // 合约是否已弃用

    /**
     * @dev 构造函数：初始化合约，设置初始供应量和代币信息
     * 所有代币都存入所有者地址
     * @param _initialSupply 初始供应量
     * @param _name 代币名称
     * @param _symbol 代币符号
     * @param _decimals 小数位数
     */
    function TetherToken(
        uint _initialSupply,
        string _name,
        string _symbol,
        uint _decimals
    ) public {
        _totalSupply = _initialSupply; // 设置总供应量
        name = _name; // 设置代币名称
        symbol = _symbol; // 设置代币符号
        decimals = _decimals; // 设置小数位数
        balances[owner] = _initialSupply; // 将所有初始代币分配给所有者
        deprecated = false; // 初始状态为未弃用
    }

    /**
     * @dev 转账函数，如果合约已弃用则转发到升级后的合约
     * @param _to 接收地址
     * @param _value 转账金额
     * 只能在合约未暂停时调用，且发送者不能在黑名单中
     */
    function transfer(address _to, uint _value) public whenNotPaused {
        require(!isBlackListed[msg.sender]); // 确保发送者不在黑名单中
        if (deprecated) {
            // 如果合约已弃用，调用升级后合约的 transferByLegacy 方法
            return
                // 调用升级后合约的 transferByLegacy 方法
                // 这里的UpgradedStandardToken不是构造函数，而是把地址类型转换为UpgradedStandardToken类型
                // UpgradedStandardToken(upgradedAddress) 返回的是一个合约实例的引用，地址是upgradedAddress
                // 相当于告诉编译器："地址 upgradedAddress 上部署的合约遵循 UpgradedStandardToken 接口"
                UpgradedStandardToken(upgradedAddress).transferByLegacy(
                    msg.sender,
                    _to,
                    _value
                );
        } else {
            // 否则调用当前合约的 transfer 方法
            return super.transfer(_to, _value);
        }
    }

    /**
     * @dev 授权转账函数，如果合约已弃用则转发到升级后的合约
     * @param _from 代币来源地址
     * @param _to 代币目标地址
     * @param _value 转账金额
     * 只能在合约未暂停时调用，且来源地址不能在黑名单中
     */
    function transferFrom(
        address _from,
        address _to,
        uint _value
    ) public whenNotPaused {
        require(!isBlackListed[_from]); // 确保来源地址不在黑名单中
        if (deprecated) {
            // 如果合约已弃用，调用升级后合约的 transferFromByLegacy 方法
            return
                UpgradedStandardToken(upgradedAddress).transferFromByLegacy(
                    msg.sender,
                    _from,
                    _to,
                    _value
                );
        } else {
            // 否则调用当前合约的 transferFrom 方法
            return super.transferFrom(_from, _to, _value);
        }
    }

    /**
     * @dev 查询余额函数，如果合约已弃用则查询升级后的合约
     * @param who 要查询的地址
     * @return 返回该地址的余额
     */
    function balanceOf(address who) public constant returns (uint) {
        if (deprecated) {
            // 如果合约已弃用，查询升级后合约的余额
            return UpgradedStandardToken(upgradedAddress).balanceOf(who);
        } else {
            // 否则查询当前合约的余额
            return super.balanceOf(who);
        }
    }

    /**
     * @dev 授权函数，如果合约已弃用则转发到升级后的合约
     * @param _spender 被授权的地址
     * @param _value 授权金额
     */
    function approve(
        address _spender,
        uint _value
    ) public onlyPayloadSize(2 * 32) {
        if (deprecated) {
            // 如果合约已弃用，调用升级后合约的 approveByLegacy 方法
            return
                UpgradedStandardToken(upgradedAddress).approveByLegacy(
                    msg.sender,
                    _spender,
                    _value
                );
        } else {
            // 否则调用当前合约的 approve 方法
            return super.approve(_spender, _value);
        }
    }

    /**
     * @dev 查询授权额度函数，如果合约已弃用则查询升级后的合约
     * @param _owner 代币所有者地址
     * @param _spender 被授权者地址
     * @return 返回剩余授权额度
     */
    function allowance(
        address _owner,
        address _spender
    ) public constant returns (uint remaining) {
        if (deprecated) {
            // 如果合约已弃用，查询升级后合约的授权额度
            return StandardToken(upgradedAddress).allowance(_owner, _spender);
        } else {
            // 否则查询当前合约的授权额度
            return super.allowance(_owner, _spender);
        }
    }

    /**
     * @dev 弃用当前合约并指定升级后的合约地址
     * @param _upgradedAddress 新合约的地址
     * 只有合约所有者可以调用
     * 一旦弃用，所有 ERC20 方法都会转发到新合约
     */
    function deprecate(address _upgradedAddress) public onlyOwner {
        deprecated = true; // 标记为已弃用
        upgradedAddress = _upgradedAddress; // 设置升级后的合约地址
        Deprecate(_upgradedAddress); // 触发弃用事件
    }

    /**
     * @dev 查询总供应量函数，如果合约已弃用则查询升级后的合约
     * @return 返回代币总供应量
     */
    function totalSupply() public constant returns (uint) {
        if (deprecated) {
            // 如果合约已弃用，查询升级后合约的总供应量
            return StandardToken(upgradedAddress).totalSupply();
        } else {
            // 否则返回当前合约的总供应量
            return _totalSupply;
        }
    }

    /**
     * @dev 发行新的代币
     * 新代币会存入所有者地址
     * @param amount 要发行的代币数量
     * 只有合约所有者可以调用
     * 发行后总供应量和所有者余额会增加
     */
    function issue(uint amount) public onlyOwner {
        require(_totalSupply + amount > _totalSupply); // 防止溢出，确保新总量大于旧总量
        require(balances[owner] + amount > balances[owner]); // 防止溢出，确保新余额大于旧余额

        balances[owner] += amount; // 增加所有者的余额
        _totalSupply += amount; // 增加总供应量
        Issue(amount); // 触发发行事件
    }

    /**
     * @dev 赎回（销毁）代币
     * 这些代币从所有者地址中扣除
     * 所有者的余额必须足够，否则调用将失败
     * @param amount 要赎回的代币数量
     * 只有合约所有者可以调用
     * 赎回后总供应量和所有者余额会减少
     */
    function redeem(uint amount) public onlyOwner {
        require(_totalSupply >= amount); // 确保总供应量足够
        require(balances[owner] >= amount); // 确保所有者余额足够

        _totalSupply -= amount; // 减少总供应量
        balances[owner] -= amount; // 减少所有者余额
        Redeem(amount); // 触发赎回事件
    }

    /**
     * @dev 设置交易费用参数
     * @param newBasisPoints 新的费率基点（1 基点 = 0.01%）
     * @param newMaxFee 新的最大手续费（单位为代币，不含小数位）
     * 只有合约所有者可以调用
     * 为确保透明度，硬编码了费用限制：费率不能超过 20 基点（0.2%），最大手续费不能超过 50 个代币
     */
    function setParams(uint newBasisPoints, uint newMaxFee) public onlyOwner {
        // 通过硬编码限制确保透明度，费用永远不会超过这些限制
        require(newBasisPoints < 20); // 费率必须小于 20 基点（0.2%）
        require(newMaxFee < 50); // 最大手续费必须小于 50 个代币

        basisPointsRate = newBasisPoints; // 设置新的费率
        maximumFee = newMaxFee.mul(10 ** decimals); // 设置新的最大手续费（乘以 10^decimals 以包含小数位）

        Params(basisPointsRate, maximumFee); // 触发参数设置事件
    }

    // 当发行新代币时触发
    event Issue(uint amount);

    // 当赎回代币时触发
    event Redeem(uint amount);

    // 当合约被弃用时触发
    event Deprecate(address newAddress);

    // 当合约设置费用参数时触发
    event Params(uint feeBasisPoints, uint maxFee);
}
